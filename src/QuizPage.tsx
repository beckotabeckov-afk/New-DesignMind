
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from './services/firebase';
import { useAuth } from './components/AuthProvider';
import { QUIZ_STEPS as DEFAULT_STEPS } from '../constants';
import { UserSelections, DesignResult, QuizStep as QuizStepType, ChoiceSummary, QuizProject } from '../types';
import { generateTextResult, generateImage } from '../gemini';
import QuizStep from './components/QuizStep';
import ResultView from './components/ResultView';
import QuizEditor from './components/QuizEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  Layout, 
  Download, 
  Upload,
  Share2, 
  LogOut, 
  Sparkles, 
  ArrowLeft, 
  Copy, 
  LayoutDashboard, 
  Settings,
  History
} from 'lucide-react';

import { resizeImage } from './utils/image';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFirestoreError = (error: unknown, operationType: string, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData.map(provider => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  const [projects, setProjects] = useState<QuizProject[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [selections, setSelections] = useState<UserSelections>({});
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [result, setResult] = useState<DesignResult | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [projectImages, setProjectImages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user || !currentProjectId) {
      setProjectImages({});
      return;
    }

    const imagesRef = collection(db, 'users', user.uid, 'projects', currentProjectId, 'images');
    const unsubscribe = onSnapshot(imagesRef, (snapshot) => {
      const images: Record<string, string> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        images[doc.id] = data.data;
      });
      setProjectImages(images);
    }, (error) => {
      console.error("Error loading images:", error);
    });

    return () => unsubscribe();
  }, [user, currentProjectId]);

  useEffect(() => {
    if (!user) return;

    const projectsRef = collection(db, 'users', user.uid, 'projects');
    const q = query(projectsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedProjects = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as QuizProject[];
      
      if (loadedProjects.length === 0) {
        // Create default project if none exist
        const defaultProj: Omit<QuizProject, 'id'> = {
          name: 'Новый дизайн-квиз',
          createdAt: Date.now(),
          steps: DEFAULT_STEPS
        };
        setDoc(doc(projectsRef, 'default'), defaultProj);
      } else {
        setProjects(loadedProjects);
        setIsInitialLoading(false);
      }
    }, (error) => {
      console.error("Firestore error:", error);
      showToast("Ошибка загрузки проектов", "error");
      setIsInitialLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const keySelected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(keySelected);
      }
    };
    checkApiKey();
  }, []);

  const handleExport = async (proj: QuizProject, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const zip = new JSZip();
    
    // Создаем копию проекта без тяжелых base64 данных в JSON
    const cleanProj = JSON.parse(JSON.stringify(proj)) as QuizProject;
    cleanProj.steps.forEach(step => {
      step.options.forEach(opt => {
        if (opt.image) {
          // Очищаем поле image в JSON, так как картинка будет лежать отдельным файлом
          opt.image = ""; 
        }
      });
    });

    zip.file('quiz.json', JSON.stringify(cleanProj, null, 2));
    
    // Добавляем изображения в ZIP отдельными файлами
    proj.steps.forEach(step => {
      step.options.forEach(opt => {
        if (opt.image) {
          const base64Data = opt.image.split(',')[1];
          zip.file(`images/${opt.id}.jpg`, base64Data, { base64: true });
        }
      });
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${proj.name}.zip`;
    link.click();
  };

  const handleZipImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    setLoadingStage('Подготовка к импорту...');

    try {
      setLoadingStage('Распаковка ZIP-архива...');
      const zip = await JSZip.loadAsync(file);
      
      // 1. Поиск quiz.json
      const jsonFile = zip.file('quiz.json');
      if (!jsonFile) {
        throw new Error('Файл quiz.json не найден в архиве');
      }

      setLoadingStage('Чтение структуры проекта...');
      const jsonContent = await jsonFile.async('string');
      const projectData = JSON.parse(jsonContent);
      
      if (!projectData.steps) {
        throw new Error('Некорректная структура проекта в quiz.json');
      }

      // 2. Загрузка изображений
      const steps = JSON.parse(JSON.stringify(projectData.steps)) as QuizStepType[];
      
      // Создаем карту опций для быстрого поиска
      const optionMap: Record<string, any> = {};
      steps.forEach(step => {
        step.options.forEach(opt => {
          optionMap[opt.id] = opt;
        });
      });

      let updatedCount = 0;
      const zipFiles = Object.entries(zip.files).filter(([_, entry]) => !entry.dir);
      const totalFiles = zipFiles.length;
      let processedFiles = 0;

      for (const [filename, zipEntry] of zipFiles) {
        processedFiles++;
        if (processedFiles % 5 === 0 || processedFiles === totalFiles) {
          setLoadingStage(`Обработка файлов: ${processedFiles}/${totalFiles}...`);
        }

        const baseName = filename.split('/').pop() || '';
        const idMatch = baseName.match(/(opt_[^.]+)\.(jpg|jpeg|png|webp)/i);
        
        if (idMatch) {
          const optId = idMatch[1];
          if (optionMap[optId]) {
            const base64 = await zipEntry.async('base64');
            const ext = idMatch[2].toLowerCase();
            const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
            const fullBase64 = `data:${mimeType};base64,${base64}`;
            
            // Сжимаем изображение перед сохранением в проект
            setLoadingStage(`Сжатие изображения ${processedFiles}/${totalFiles}...`);
            const resized = await resizeImage(fullBase64, 1024); // Увеличиваем до 1024px
            optionMap[optId].image = resized;
            updatedCount++;
          }
        }
      }

      // 3. Сохранение в Firebase
      setLoadingStage('Сохранение проекта в облако...');
      const newId = `import_${Date.now()}`;
      
      // Извлекаем изображения для отдельного сохранения
      const imagesToSave: {id: string, data: string}[] = [];
      const stepsToSave = JSON.parse(JSON.stringify(steps)) as QuizStepType[];
      
      stepsToSave.forEach(step => {
        step.options.forEach(opt => {
          if (opt.image) {
            imagesToSave.push({ id: opt.id, data: opt.image });
            opt.image = ""; // Очищаем в основном документе
          }
        });
      });

      const newProj: Omit<QuizProject, 'id'> = {
        name: projectData.name || 'Импортированный квиз',
        createdAt: Date.now(),
        steps: stepsToSave
      };

      // Сохранение с таймаутом
      const projectRef = doc(db, 'users', user.uid, 'projects', newId);
      const savePromise = setDoc(projectRef, newProj);
      
      // Сохраняем изображения в подколлекцию
      const imagesRef = collection(db, 'users', user.uid, 'projects', newId, 'images');
      const saveImagesPromise = Promise.all(imagesToSave.map(img => 
        setDoc(doc(imagesRef, img.id), { id: img.id, data: img.data })
      ));

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Превышено время ожидания сохранения в облако. Проверьте интернет-соединение.')), 30000)
      );

      try {
        await Promise.race([Promise.all([savePromise, saveImagesPromise]), timeoutPromise]);
      } catch (saveErr) {
        handleFirestoreError(saveErr, 'write', `users/${user.uid}/projects/${newId}`);
      }

      showToast(`Проект импортирован! Загружено ${updatedCount} изображений.`, 'success');
      
      // Сразу открываем его
      setCurrentProjectId(newId);
      setCurrentStepId(steps[0].id);
      setSelections({});
      setResult(null);
      setIsEditMode(false);

    } catch (err: any) {
      console.error('ZIP import error:', err);
      showToast(err.message || 'Ошибка импорта ZIP', 'error');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSelectApiKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const createNewQuiz = async () => {
    if (!user || isProcessing) return;
    setIsProcessing(true);
    const newId = `proj_${Date.now()}`;
    const newProj: Omit<QuizProject, 'id'> = {
      name: 'Новый дизайн-квиз',
      createdAt: Date.now(),
      steps: DEFAULT_STEPS
    };
    try {
      await setDoc(doc(db, 'users', user.uid, 'projects', newId), newProj);
      setCurrentProjectId(newId);
      setCurrentStepId(DEFAULT_STEPS[0].id);
      setSelections({});
      setResult(null);
      setIsEditMode(true);
      showToast('Проект создан');
    } catch (e) {
      showToast('Ошибка создания', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const duplicateProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user || isProcessing) return;
    
    const source = projects.find(p => p.id === id);
    if (!source) return;
    
    setIsProcessing(true);
    const newId = `proj_copy_${Date.now()}`;
    const clone: Omit<QuizProject, 'id'> = {
      ...JSON.parse(JSON.stringify(source)),
      name: `${source.name} (Копия)`,
      createdAt: Date.now()
    };
    
    try {
      // 1. Копируем сам проект
      await setDoc(doc(db, 'users', user.uid, 'projects', newId), clone);
      
      // 2. Копируем изображения из подколлекции
      const sourceImagesRef = collection(db, 'users', user.uid, 'projects', id, 'images');
      const targetImagesRef = collection(db, 'users', user.uid, 'projects', newId, 'images');
      const imagesSnapshot = await getDocs(sourceImagesRef);
      
      if (!imagesSnapshot.empty) {
        await Promise.all(imagesSnapshot.docs.map(d => 
          setDoc(doc(targetImagesRef, d.id), d.data())
        ));
      }

      showToast('Квиз продублирован');
    } catch (e) {
      showToast('Ошибка дублирования', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!user || !deleteConfirmId) return;
    const idToDelete = deleteConfirmId;
    setDeleteConfirmId(null); // Закрываем окно сразу для мгновенного отклика
    try {
      // 1. Удаляем изображения
      const imagesRef = collection(db, 'users', user.uid, 'projects', idToDelete, 'images');
      const imagesSnapshot = await getDocs(imagesRef);
      await Promise.all(imagesSnapshot.docs.map(d => deleteDoc(d.ref)));
      
      // 2. Удаляем сам проект
      await deleteDoc(doc(db, 'users', user.uid, 'projects', idToDelete));
      showToast('Проект удален');
    } catch (e) {
      showToast('Ошибка удаления', 'error');
    }
  };

  const updateProjectData = async (updates: Partial<QuizProject>) => {
    if (!user || !currentProjectId || !activeProject) return;
    try {
      const projectRef = doc(db, 'users', user.uid, 'projects', currentProjectId);
      
      if (updates.steps) {
        const imagesToSave: {id: string, data: string}[] = [];
        const stepsToSave = JSON.parse(JSON.stringify(updates.steps)) as QuizStepType[];
        
        // Собираем ID всех опций, у которых есть изображение в текущем состоянии редактора
        // Важно: "" означает, что изображение уже в подколлекции, его нельзя удалять
        const optionIdsWithImages = new Set<string>();
        
        stepsToSave.forEach(step => {
          step.options.forEach(opt => {
            if (opt.image !== undefined && opt.image !== null && opt.image !== '') {
              // Если это новая загрузка (data URL)
              if (opt.image.startsWith('data:')) {
                imagesToSave.push({ id: opt.id, data: opt.image });
              }
              optionIdsWithImages.add(opt.id);
              opt.image = ""; // Очищаем в основном документе
            } else if (opt.image === "") {
              // Если это уже сохраненное изображение
              optionIdsWithImages.add(opt.id);
            }
          });
        });

        // Сохраняем/обновляем изображения в подколлекции
        const imagesRef = collection(db, 'users', user.uid, 'projects', currentProjectId, 'images');
        await Promise.all(imagesToSave.map(img => 
          setDoc(doc(imagesRef, img.id), { id: img.id, data: img.data })
        ));
        
        // Удаляем из Firestore те изображения, которые были удалены в редакторе
        // (их ID больше нет в списке optionIdsWithImages)
        const imagesSnapshot = await getDocs(imagesRef);
        await Promise.all(imagesSnapshot.docs.map(d => {
          if (!optionIdsWithImages.has(d.id)) {
            return deleteDoc(d.ref);
          }
          return Promise.resolve();
        }));

        updates.steps = stepsToSave;
      }
      
      await updateDoc(projectRef, updates);
    } catch (e) {
      handleFirestoreError(e, 'update', `users/${user.uid}/projects/${currentProjectId}`);
    }
  };

  const handleSelect = (value: string | string[]) => {
    if (!activeProject) return;
    const currentStep = activeProject.steps.find(s => s.id === currentStepId);
    if (!currentStep) return;

    const updatedSelections = { ...selections, [currentStepId]: value };
    setSelections(updatedSelections);
    setHistory([...history, currentStepId]);

    let nextId: string | undefined;
    if (!currentStep.isMulti && !currentStep.isText) {
      const chosenOption = currentStep.options.find(o => o.label === value);
      nextId = chosenOption?.nextStepId;
    }
    if (!nextId && currentStep.nextStepId) nextId = currentStep.nextStepId;
    if (!nextId) {
      const idx = activeProject.steps.findIndex(s => s.id === currentStepId);
      nextId = idx < activeProject.steps.length - 1 ? activeProject.steps[idx + 1].id : 'finish';
    }

    console.log("handleSelect: currentStepId =", currentStepId, "nextId =", nextId);

    if (nextId === 'finish') {
      processFinalResult(updatedSelections);
    } else {
      setCurrentStepId(nextId);
    }
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const prevId = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setCurrentStepId(prevId);
  };

  const handleRegenerate = async (feedback: string) => {
    if (!activeProject) return;
    setLoading(true);
    setLoadingStage('Применение правок...');
    
    try {
      const choicesSummary: ChoiceSummary[] = activeProject.steps
        .filter(step => selections[step.id])
        .map(step => {
          const val = selections[step.id];
          const labels = Array.isArray(val) ? val : [val];
          if (step.isText) return { stepTitle: step.title, label: labels.join(', ') };
          const opt = step.options.find(o => labels.includes(o.label));
          return { stepTitle: step.title, label: labels.join(', '), image: opt?.image };
        });

      const textData = await generateTextResult(selections, choicesSummary, feedback);
      
      const initialResult: DesignResult = {
        technicalAssignment: textData.technicalAssignment,
        moodboardDescription: textData.moodboardDescription,
        choices: choicesSummary
      };
      
      setResult(initialResult);
      setLoading(false);

      const choicesContext = choicesSummary.map(c => c.label).join(', ');
      const [mood, int, bath, bathMood] = await Promise.all([
        generateImage(textData.mainMoodboardPrompt, true, choicesContext),
        generateImage(textData.interiorVisualPrompt, false, choicesContext),
        generateImage(textData.bathroomVisualPrompt, false, choicesContext),
        generateImage(textData.bathroomMoodboardPrompt, true, choicesContext)
      ]);

      setResult(prev => prev ? {
        ...prev,
        moodboardImageUrl: mood,
        interiorVisualUrl: int,
        bathroomVisualUrl: bath,
        bathroomMoodboardUrl: bathMood
      } : null);

    } catch (err: any) {
      showToast('Ошибка: ' + err.message, 'error');
      setLoading(false);
    }
  };

  const processFinalResult = async (finalSelections: UserSelections) => {
    if (!activeProject) return;
    setLoading(true);
    setLoadingStage('Анализ архитектурных предпочтений...');
    
    try {
      const choicesSummary: ChoiceSummary[] = activeProject.steps
        .filter(step => finalSelections[step.id])
        .map(step => {
          const val = finalSelections[step.id];
          const labels = Array.isArray(val) ? val : [val];
          if (step.isText) return { stepTitle: step.title, label: labels.join(', ') };
          const opt = step.options.find(o => labels.includes(o.label));
          return { stepTitle: step.title, label: labels.join(', '), image: opt?.image };
        });

      const textData = await generateTextResult(finalSelections, choicesSummary);
      
      const initialResult: DesignResult = {
        technicalAssignment: textData.technicalAssignment,
        moodboardDescription: textData.moodboardDescription,
        choices: choicesSummary
      };
      
      setResult(initialResult);
      setLoading(false);

      const choicesContext = choicesSummary.map(c => c.label).join(', ');
      
      const [mood, int, bath, bathMood] = await Promise.all([
        generateImage(textData.mainMoodboardPrompt, true, choicesContext),
        generateImage(textData.interiorVisualPrompt, false, choicesContext),
        generateImage(textData.bathroomVisualPrompt, false, choicesContext),
        generateImage(textData.bathroomMoodboardPrompt, true, choicesContext)
      ]);

      setResult(prev => prev ? {
        ...prev,
        moodboardImageUrl: mood,
        interiorVisualUrl: int,
        bathroomVisualUrl: bath,
        bathroomMoodboardUrl: bathMood
      } : null);

    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
        showToast('Нужен платный API-ключ', 'error');
      } else {
        showToast('Ошибка: ' + err.message, 'error');
      }
      setLoading(false);
    }
  };

  const rawProject = projects.find(p => p.id === currentProjectId);
  const activeProject = useMemo(() => {
    if (!rawProject) return null;
    const cloned = JSON.parse(JSON.stringify(rawProject)) as QuizProject;
    cloned.steps.forEach(step => {
      step.options.forEach(opt => {
        if (projectImages[opt.id]) {
          opt.image = projectImages[opt.id];
        }
      });
    });
    return cloned;
  }, [rawProject, projectImages]);

  const currentStepData = activeProject?.steps.find(s => s.id === currentStepId);
  const progress = activeProject && activeProject.steps.length > 0 
    ? ((activeProject.steps.findIndex(s => s.id === currentStepId) + 1) / activeProject.steps.length) * 100 
    : 0;

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] p-6 text-center space-y-8">
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className={`fixed top-8 left-1/2 px-8 py-4 rounded-full font-bold shadow-2xl z-[100] ${toast.type === 'success' ? 'bg-[#2C3E50] text-white' : 'bg-red-500 text-white'}`}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-8"
        >
          <div className="w-24 h-24 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center text-4xl shadow-sm mb-4">
            <Sparkles className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold serif text-white">DesignMind Pro</h1>
          <p className="max-w-md text-gray-400 font-light leading-relaxed">Для работы с искусственным интеллектом выберите API-ключ из оплаченного Google Cloud проекта.</p>
          <button onClick={handleSelectApiKey} className="bg-orange-500 text-white px-12 py-6 rounded-full font-bold shadow-2xl hover:bg-orange-600 transition-all">Активировать доступ</button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] p-6">
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className={`fixed top-8 left-1/2 px-8 py-4 rounded-full font-bold shadow-2xl z-[100] ${toast.type === 'success' ? 'bg-[#2C3E50] text-white' : 'bg-red-500 text-white'}`}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
        <Loader2 className="w-16 h-16 text-orange-400 animate-spin mb-10" />
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white serif text-center max-w-lg"
        >
          {loadingStage}
        </motion.h2>
      </div>
    );
  }

  if (result) return (
    <>
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-8 left-1/2 px-8 py-4 rounded-full font-bold shadow-2xl z-[100] ${toast.type === 'success' ? 'bg-[#2C3E50] text-white' : 'bg-red-500 text-white'}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <ResultView result={result} onRestart={() => {setResult(null); setCurrentProjectId(null);}} onRegenerate={handleRegenerate} />
      </motion.div>
    </>
  );

  if (isEditMode && !activeProject && currentProjectId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A0A] p-6">
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className={`fixed top-8 left-1/2 px-8 py-4 rounded-full font-bold shadow-2xl z-[100] ${toast.type === 'success' ? 'bg-[#2C3E50] text-white' : 'bg-red-500 text-white'}`}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
        <Loader2 className="w-16 h-16 text-orange-400 animate-spin mb-10" />
        <h2 className="text-2xl font-bold text-white serif">Загрузка редактора...</h2>
      </div>
    );
  }

  if (!currentProjectId) {
    return (
      <div className="min-h-screen bg-[#fafafa] px-6 py-12 md:px-12 md:py-20">
        <AnimatePresence>
          {toast && (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className={`fixed top-8 left-1/2 px-8 py-4 rounded-full font-bold shadow-2xl z-[100] ${toast.type === 'success' ? 'bg-[#2C3E50] text-white' : 'bg-red-500 text-white'}`}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-6xl mx-auto">
          <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-5xl md:text-7xl font-bold serif text-[#2C3E50] tracking-tight"
              >
                Design<span className="italic font-light text-orange-400">Mind</span>
              </motion.h1>
              <div className="flex items-center gap-3">
                <p className="text-gray-400 uppercase tracking-[0.5em] text-[10px] font-black opacity-60">Architectural Engine v8.0</p>
                <div className="h-px w-12 bg-gray-200" />
                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Cloud Sync Active</span>
              </div>
            </div>
            <div className="flex gap-4">
              <label className="bg-white text-[#2C3E50] border border-[#E8E2D9] px-10 py-6 rounded-full font-bold hover:bg-gray-50 transition-all flex items-center gap-2 cursor-pointer shadow-sm">
                <Upload className="w-5 h-5" />
                <span>Импорт (ZIP)</span>
                <input type="file" accept=".zip" className="hidden" onChange={handleZipImport} />
              </label>
              <button onClick={createNewQuiz} className="bg-[#2C3E50] text-white px-14 py-6 rounded-full font-bold shadow-2xl hover:bg-black transition-all flex items-center gap-4 active:scale-95">
                <Plus className="w-5 h-5" />
                <span>Новый проект</span>
              </button>
            </div>
          </header>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {isInitialLoading ? (
              // Skeleton loaders
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-[#E8E2D9] animate-pulse min-h-[320px] flex flex-col">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl mb-8" />
                  <div className="h-8 bg-gray-100 rounded-lg w-3/4 mb-4" />
                  <div className="h-4 bg-gray-50 rounded-md w-1/2 mb-4" />
                  <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between">
                    <div className="h-3 bg-gray-50 rounded w-16" />
                    <div className="h-3 bg-gray-50 rounded w-10" />
                  </div>
                </div>
              ))
            ) : (
              projects.map((proj, idx) => (
                <motion.div 
                  key={proj.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={(e) => { 
                    if (isProcessing) return;
                    e.preventDefault();
                    setCurrentProjectId(proj.id); 
                    setCurrentStepId(proj.steps[0].id); 
                    setSelections({}); 
                    setResult(null); 
                    setIsEditMode(false); 
                  }} 
                  className="group bg-white p-8 rounded-[2.5rem] border border-[#E8E2D9] hover:border-[#2C3E50] cursor-pointer transition-all hover:shadow-[0_30px_60px_-15px_rgba(44,62,80,0.12)] relative overflow-hidden flex flex-col min-h-[320px]"
                >
                  <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                    <button 
                      onClick={(e) => handleExport(proj, e)} 
                      className="w-9 h-9 rounded-full bg-white border border-gray-100 text-gray-400 hover:text-orange-500 flex items-center justify-center shadow-sm hover:scale-110 transition-all"
                      title="Экспорт (ZIP)"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => duplicateProject(proj.id, e)} 
                      className="w-9 h-9 rounded-full bg-white border border-gray-100 text-gray-400 hover:text-blue-500 flex items-center justify-center shadow-sm hover:scale-110 transition-all"
                      title="Дублировать"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteProject(proj.id, e)} 
                      className="w-9 h-9 rounded-full bg-white border border-gray-100 text-gray-400 hover:text-red-500 flex items-center justify-center shadow-sm hover:scale-110 transition-all"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-orange-500 group-hover:text-white transition-all mb-8 shadow-sm border border-gray-100">
                    <LayoutDashboard className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold text-[#2C3E50] mb-3 serif leading-tight">{proj.name}</h3>
                  <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-3 h-3 text-gray-400" />
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{proj.steps.length} ШАГОВ</p>
                    </div>
                    <span className="text-orange-500 text-xs font-bold uppercase group-hover:translate-x-2 transition-transform flex items-center gap-1">
                      Старт <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        <AnimatePresence>
          {deleteConfirmId && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center space-y-8"
              >
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#2C3E50] serif">Удалить проект?</h3>
                  <p className="text-gray-400 text-sm font-light">Это действие нельзя будет отменить.</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 py-4 rounded-full border border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-all"
                  >
                    Отмена
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 py-4 rounded-full bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                  >
                    Удалить
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-8 left-1/2 px-8 py-4 rounded-full font-bold shadow-2xl z-[100] ${toast.type === 'success' ? 'bg-[#2C3E50] text-white' : 'bg-red-500 text-white'}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
      <nav className="p-4 md:p-8 md:px-16 flex justify-between items-center bg-white border-b border-[#E8E2D9] sticky top-0 z-50">
        <button onClick={() => navigate('/')} className="text-[#2C3E50] hover:opacity-70 flex items-center gap-4 font-bold transition-all group">
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#2C3E50] group-hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] font-black">Главная</span>
        </button>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsEditMode(!isEditMode)} className={`text-[10px] font-black uppercase tracking-[0.2em] px-10 py-4 rounded-full border transition-all flex items-center gap-2 ${isEditMode ? 'bg-[#2C3E50] text-white' : 'bg-white text-[#2C3E50] border-gray-200'}`}>
            <Settings className={`w-4 h-4 ${isEditMode ? 'animate-spin-slow' : ''}`} />
            {isEditMode ? 'Завершить' : 'Редактировать'}
          </button>
        </div>
      </nav>

      {!isEditMode && (
        <div className="w-full h-1.5 bg-gray-100 no-print">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-orange-400 transition-all duration-700 ease-out" 
          />
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-16 flex-1 w-full">
        <AnimatePresence mode="wait">
          {isEditMode ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <QuizEditor 
                steps={activeProject?.steps || []} 
                quizName={activeProject?.name || ''}
                onRename={(name) => updateProjectData({ name })}
                onSave={(newSteps) => updateProjectData({ steps: newSteps })} 
                onExit={() => setIsEditMode(false)}
                onExport={() => activeProject && handleExport(activeProject, { preventDefault: () => {}, stopPropagation: () => {} } as any)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-4xl mx-auto"
            >
               {currentStepData && (
                 <QuizStep 
                   step={currentStepData} 
                   onSelect={handleSelect} 
                   onBack={handleBack} 
                   canGoBack={history.length > 0} 
                   currentValue={selections[currentStepId]} 
                 />
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default QuizPage;

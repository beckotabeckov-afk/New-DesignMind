
import React, { useState } from 'react';
import { QuizStep, QuizAnswer } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  Check, 
  X, 
  GripVertical, 
  Image as ImageIcon,
  ChevronRight,
  Settings2,
  Type,
  Layers,
  FileArchive
} from 'lucide-react';

import { resizeImage } from '../utils/image';

interface Props {
  steps: QuizStep[];
  quizName: string;
  onRename: (name: string) => void;
  onSave: (newSteps: QuizStep[]) => void;
  onExit: () => void;
  onExport: () => void;
}

const QuizEditor: React.FC<Props> = ({ steps, quizName, onRename, onSave, onExit, onExport }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [stepToDelete, setStepToDelete] = useState<string | null>(null);
  const [editingNumber, setEditingNumber] = useState<{index: number, value: string} | null>(null);
  const [imageActionMenu, setImageActionMenu] = useState<{stepId: string, optId: string} | null>(null);

  const updateStep = (id: string, updates: Partial<QuizStep>) => {
    onSave(steps.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addStep = () => {
    onSave([...steps, { id: `step_${Date.now()}`, title: 'Новый раздел', question: 'Ваш вопрос?', options: [{ id: `opt_${Date.now()}`, label: 'Вариант 1' }] }]);
  };

  const duplicateStep = (index: number) => {
    const stepToCopy = steps[index];
    const newStep = {
      ...JSON.parse(JSON.stringify(stepToCopy)),
      id: `step_copy_${Date.now()}`,
      title: `${stepToCopy.title} (копия)`
    };
    const newSteps = [...steps];
    newSteps.splice(index + 1, 0, newStep);
    onSave(newSteps);
  };

  const updateOption = (stepId: string, optId: string, updates: Partial<QuizAnswer>) => {
    const newSteps = steps.map(s => {
      if (s.id === stepId) {
        return {
          ...s,
          options: s.options.map(o => {
            if (o.id === optId) {
              const newOpt = { ...o, ...updates };
              // Explicitly remove image if it's undefined to ensure Firestore updates correctly
              if ('image' in updates && updates.image === undefined) {
                delete (newOpt as any).image;
              }
              return newOpt;
            }
            return o;
          })
        };
      }
      return s;
    });
    onSave(newSteps);
  };

  const handleManualMove = (currentIndex: number, newPosStr: string) => {
    let targetIndex = parseInt(newPosStr, 10) - 1;
    if (isNaN(targetIndex) || targetIndex < 0) { setEditingNumber(null); return; }
    if (targetIndex >= steps.length) targetIndex = steps.length - 1;
    const newSteps = [...steps];
    const [movedItem] = newSteps.splice(currentIndex, 1);
    newSteps.splice(targetIndex, 0, movedItem);
    onSave(newSteps);
    setEditingNumber(null);
  };

  const handleZipImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const zip = await JSZip.loadAsync(file);
      let newSteps: QuizStep[] = JSON.parse(JSON.stringify(steps));
      let newName = quizName;

      // 1. Поиск quiz.json для структуры
      const jsonFile = zip.file('quiz.json');
      if (jsonFile) {
        const jsonContent = await jsonFile.async('string');
        const projectData = JSON.parse(jsonContent);
        if (projectData.steps) newSteps = projectData.steps;
        if (projectData.name) {
          newName = projectData.name;
          onRename(newName);
        }
      }

      // 2. Загрузка изображений
      let updatedCount = 0;
      for (const [filename, zipEntry] of Object.entries(zip.files)) {
        if (zipEntry.dir) continue;
        
        const baseName = filename.split('/').pop() || '';
        const idMatch = baseName.match(/(opt_[^.]+)\.(jpg|jpeg|png|webp)/i);
        
        if (idMatch) {
          const optId = idMatch[1];
          const base64 = await zipEntry.async('base64');
          const ext = idMatch[2].toLowerCase();
          const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
          const dataUrl = `data:${mimeType};base64,${base64}`;

          newSteps.forEach(step => {
            step.options.forEach(opt => {
              if (opt.id === optId) {
                opt.image = dataUrl;
                updatedCount++;
              }
            });
          });
        }
      }

      onSave(newSteps);
      alert(`Импорт завершен! Загружено шагов: ${newSteps.length}, изображений: ${updatedCount}`);
    } catch (err) {
      console.error('ZIP import error:', err);
      alert('Ошибка при чтении ZIP-архива. Убедитесь, что это корректный экспорт квиза.');
    }
    e.target.value = '';
  };

  return (
    <>
      <AnimatePresence>
        {imageActionMenu && (
          <div className="fixed inset-0 z-[999999] flex items-end sm:items-center justify-center p-6 bg-black/40 backdrop-blur-sm" onClick={() => setImageActionMenu(null)}>
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100"
            >
              <div className="p-8 border-b border-gray-50 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Действие с фото</p>
              </div>
              <div className="p-4 space-y-2">
                <button 
                  onClick={() => {
                    const input = document.getElementById(`file-input-${imageActionMenu.optId}`) as HTMLInputElement;
                    input?.click();
                    setImageActionMenu(null);
                  }}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl hover:bg-gray-50 text-[#2C3E50] font-bold transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span>Загрузить новое</span>
                </button>
                <button 
                  onClick={() => {
                    updateOption(imageActionMenu.stepId, imageActionMenu.optId, { image: undefined });
                    setImageActionMenu(null);
                  }}
                  className="w-full flex items-center gap-4 p-5 rounded-2xl hover:bg-red-50 text-red-500 font-bold transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <span>Очистить</span>
                </button>
                <button 
                  onClick={() => setImageActionMenu(null)}
                  className="w-full p-5 text-gray-400 font-bold hover:text-gray-600 transition-colors"
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stepToDelete && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[3.5rem] p-14 max-w-sm w-full shadow-2xl text-center space-y-8 border border-gray-100"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold text-[#2C3E50] serif">Удалить раздел?</h3>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { 
                    const id = stepToDelete;
                    setStepToDelete(null); // Закрываем сразу
                    onSave(steps.filter(s => s.id !== id)); 
                  }} 
                  className="py-5 rounded-2xl bg-red-500 text-white font-black text-[11px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                >
                  Да, удалить
                </button>
                <button 
                  onClick={() => setStepToDelete(null)} 
                  className="py-5 rounded-2xl bg-gray-50 text-gray-400 font-black text-[11px] uppercase tracking-widest hover:bg-gray-100 transition-all"
                >
                  Отмена
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-12 pb-40">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-6 justify-between items-center bg-white p-8 rounded-[2.5rem] border border-[#E8E2D9] shadow-sm"
        >
          <div className="flex-1 min-w-[300px]">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Название квиза</label>
            <input 
              value={quizName} 
              onChange={(e) => onRename(e.target.value)} 
              className="text-3xl md:text-4xl font-bold text-[#2C3E50] serif bg-transparent outline-none w-full focus:border-orange-500 transition-all" 
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 bg-orange-50 text-orange-600 px-6 py-3 rounded-full font-bold text-[10px] uppercase cursor-pointer hover:bg-orange-100 transition-all border border-orange-100 shadow-sm">
              <Upload className="w-3 h-3" />
              Импорт (ZIP)
              <input type="file" accept=".zip" className="hidden" onChange={handleZipImport} />
            </label>
            <button onClick={onExport} className="flex items-center gap-2 bg-gray-50 text-gray-400 px-6 py-3 rounded-full font-bold text-[10px] uppercase border border-gray-100 hover:bg-gray-100 transition-all">
              <Download className="w-3 h-3" />
              Экспорт (ZIP)
            </button>
            <button onClick={onExit} className="flex items-center gap-2 bg-[#2C3E50] text-white px-8 py-3 rounded-full font-bold text-[10px] uppercase shadow-xl hover:bg-black transition-all">
              <Check className="w-3 h-3" />
              Готово
            </button>
          </div>
        </motion.div>

        <div className="grid gap-12">
          {steps.map((step, index) => (
            <motion.div 
              key={step.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              draggable 
              onDragStart={() => setDraggedIndex(index)} 
              onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index); }} 
              onDrop={() => {
                if (draggedIndex === null || draggedIndex === index) return;
                const newSteps = [...steps];
                const [draggedItem] = newSteps.splice(draggedIndex, 1);
                newSteps.splice(index, 0, draggedItem);
                onSave(newSteps);
                setDraggedIndex(null); setDragOverIndex(null);
              }} 
              className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all ${draggedIndex === index ? 'opacity-30' : 'border-gray-100'} ${dragOverIndex === index ? 'border-orange-500 border-dashed' : 'hover:border-[#E8E2D9]'} relative shadow-sm group`}
            >
              
              <div className="absolute top-8 right-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => duplicateStep(index)} 
                  className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-gray-100 transition-all" 
                  title="Дублировать"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => steps.length > 1 ? setStepToDelete(step.id) : alert("Минимум 1 шаг")} 
                  className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="absolute -left-4 top-10 w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl border-4 border-[#fafafa] shadow-lg cursor-move">
                <input 
                  type="text" 
                  value={editingNumber?.index === index ? editingNumber.value : index + 1} 
                  onFocus={() => setEditingNumber({index, value: (index + 1).toString()})} 
                  onChange={(e) => setEditingNumber({index, value: e.target.value})} 
                  onBlur={(e) => handleManualMove(index, e.target.value)} 
                  className="w-full h-full bg-transparent text-center outline-none" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pl-10">
                <div className="md:col-span-1">
                  <label className="text-[9px] font-black uppercase text-gray-500 flex items-center gap-2 mb-2">
                    <Settings2 className="w-3 h-3" />
                    Внутренний ID
                  </label>
                  <input 
                    value={step.title} 
                    onChange={e => updateStep(step.id, { title: e.target.value })} 
                    className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-orange-500/20 text-[#2C3E50] transition-all" 
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 flex items-center gap-2 mb-2">
                    <ChevronRight className="w-3 h-3" />
                    Переход
                  </label>
                  <select 
                    value={step.nextStepId || ''} 
                    onChange={e => updateStep(step.id, { nextStepId: e.target.value || undefined })} 
                    className="w-full p-4 bg-gray-50 rounded-xl outline-none text-[#2C3E50] appearance-none"
                  >
                    <option value="" className="bg-white">По порядку</option>
                    {steps.filter(s => s.id !== step.id).map(s => <option key={s.id} value={s.id} className="bg-white">{s.title}</option>)}
                    <option value="finish" className="bg-white">🏆 Финиш</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex items-end gap-6 pb-4">
                  <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold uppercase text-gray-400 hover:text-[#2C3E50] transition-colors">
                    <input 
                      type="checkbox" 
                      checked={step.isMulti} 
                      onChange={e => updateStep(step.id, { isMulti: e.target.checked })} 
                      className="w-4 h-4 rounded border-gray-200 bg-white text-orange-500 focus:ring-orange-500"
                    /> 
                    <Layers className="w-3 h-3" />
                    Мультивыбор
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold uppercase text-gray-400 hover:text-[#2C3E50] transition-colors">
                    <input 
                      type="checkbox" 
                      checked={step.isText} 
                      onChange={e => updateStep(step.id, { isText: e.target.checked })} 
                      className="w-4 h-4 rounded border-gray-200 bg-white text-orange-500 focus:ring-orange-500"
                    /> 
                    <Type className="w-3 h-3" />
                    Текстовый ввод
                  </label>
                </div>
                <div className="md:col-span-4">
                  <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block">Вопрос для пользователя</label>
                  <input 
                    value={step.question} 
                    onChange={e => updateStep(step.id, { question: e.target.value })} 
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-xl text-xl font-bold serif outline-none focus:border-orange-500 text-[#2C3E50] transition-all" 
                  />
                </div>
              </div>

              {!step.isText && (
                <div className="space-y-4 pl-10">
                   {step.options.map(opt => (
                     <motion.div 
                        key={opt.id} 
                        className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group/opt hover:border-[#E8E2D9] transition-all"
                      >
                        <div 
                          onClick={() => {
                            if (opt.image) {
                              setImageActionMenu({ stepId: step.id, optId: opt.id });
                            }
                          }}
                          className="w-16 h-16 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden shadow-sm flex-shrink-0 group-hover:border-orange-500/50 transition-colors cursor-pointer"
                        >
                          {opt.image ? (
                            <img src={opt.image} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-300" />
                          )}
                          <input 
                            id={`file-input-${opt.id}`}
                            type="file" 
                            accept="image/*" 
                            className={`absolute inset-0 opacity-0 cursor-pointer ${opt.image ? 'pointer-events-none' : 'z-10'}`} 
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = async (ev) => {
                                  const compressed = await resizeImage(ev.target?.result as string, 1024);
                                  updateOption(step.id, opt.id, { image: compressed });
                                };
                                reader.readAsDataURL(file);
                              }
                              e.target.value = '';
                            }} 
                          />
                        </div>
                        <div className="flex-1 min-w-[200px] space-y-2">
                          <input 
                            value={opt.label} 
                            placeholder="Текст варианта" 
                            onChange={e => updateOption(step.id, opt.id, { label: e.target.value })} 
                            className="w-full bg-transparent font-bold outline-none border-b border-transparent focus:border-orange-500 text-[#2C3E50] transition-all" 
                          />
                          <input 
                            value={opt.description || ''} 
                            placeholder="Описание или цена (необяз.)" 
                            onChange={e => updateOption(step.id, opt.id, { description: e.target.value })} 
                            className="w-full bg-transparent text-[10px] text-gray-400 font-medium outline-none" 
                          />
                        </div>
                        <button 
                          onClick={() => updateStep(step.id, { options: step.options.filter(o => o.id !== opt.id) })} 
                          className="text-gray-300 hover:text-red-500 transition-all p-2 opacity-0 group-hover/opt:opacity-100"
                        >
                          <X className="w-5 h-5" />
                        </button>
                     </motion.div>
                   ))}
                   <button 
                    onClick={() => updateStep(step.id, { options: [...step.options, { id: `opt_${Date.now()}`, label: 'Новый вариант' }] })} 
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 px-8 py-3 border border-orange-500/20 rounded-full hover:bg-orange-500/10 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    Добавить вариант
                  </button>
                </div>
              )}
            </motion.div>
          ))}
          <button 
            onClick={addStep} 
            className="w-full py-16 rounded-[2.5rem] border-4 border-dashed border-gray-100 text-gray-300 font-bold hover:border-orange-500 hover:text-orange-500 transition-all uppercase tracking-[0.3em] text-[11px] bg-white group"
          >
            <div className="flex flex-col items-center gap-4 group-hover:scale-110 transition-transform">
              <Plus className="w-10 h-10" />
              + Добавить новый этап
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default QuizEditor;

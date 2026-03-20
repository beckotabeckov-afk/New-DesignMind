
import { QuizStep } from './types';

export const QUIZ_STEPS: QuizStep[] = [
  {
    id: 'objectName',
    title: 'Название',
    question: 'Как называется ваш объект?',
    isText: true,
    options: []
  },
  {
    id: 'projectType',
    title: 'Тип проекта',
    question: 'Что мы проектируем?',
    options: [
      { id: 'interiors', label: 'Дизайн интерьера', description: 'Работа с внутренним пространством, мебелью и декором', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600' },
      { id: 'architecture', label: 'Архитектура', description: 'Экстерьерные решения, фасады, форма здания и ландшафт', image: 'https://images.unsplash.com/photo-1518005020481-a682153259e0?auto=format&fit=crop&q=80&w=600' }
    ]
  },
  {
    id: 'style',
    title: 'Стиль',
    question: 'Выберите базовый стиль дизайна:',
    options: [
      { id: 'neoclassic', label: 'Неоклассика', image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=600' },
      { id: 'artdeco', label: 'Артдеко', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600' },
      { id: 'scandi', label: 'Сканди', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600' },
      { id: 'min', label: 'Минимализм', image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=600' },
      { id: 'loft', label: 'Лофт', image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=1000' },
      { id: 'ethnic', label: 'Этнический', image: 'https://images.unsplash.com/photo-1603126727210-9dd9359e1397?auto=format&fit=crop&q=80&w=600' }
    ]
  },
  {
    id: 'acSystem',
    title: 'Система кондиционирования',
    question: 'Выберите вариант системы кондиционирования:',
    options: [
      { id: 'ac1', label: 'Обычный настенный конд', description: 'цена 500 уе за шт', image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=600' },
      { id: 'ac2', label: 'Канальный кондиционер с вентиляцией', description: 'цена 1500 уе за шт', image: 'https://images.unsplash.com/photo-1599394022918-6c276a50bb0a?auto=format&fit=crop&q=80&w=600' }
    ]
  },
  {
    id: 'radiators',
    title: 'Радиаторы',
    question: 'Тип отопления:',
    options: [
      { id: 'rad1', label: 'Вертикальный радиатор', description: 'цена от 500 уе за шт', image: 'https://images.unsplash.com/photo-1631675510692-299f06e30026?auto=format&fit=crop&q=80&w=600' },
      { id: 'rad2', label: 'Панельный радиатор', description: 'цена 150 уе за шт', image: 'https://images.unsplash.com/photo-1520699049698-acd2fccb8cc8?auto=format&fit=crop&q=80&w=600' },
      { id: 'rad3', label: 'Стилизованные радиаторы', description: 'цена 700 уе за шт', image: 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?auto=format&fit=crop&q=80&w=600' }
    ]
  },
  {
    id: 'plumbingColor',
    title: 'Цвет сантехники',
    question: 'Выберите цвета (можно несколько):',
    isMulti: true,
    options: [
      { id: 'pl1', label: 'хром', image: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&q=80&w=600' },
      { id: 'pl2', label: 'брашед', image: 'https://images.unsplash.com/photo-1612151631551-76495b6c3182?auto=format&fit=crop&q=80&w=600' },
      { id: 'pl3', label: 'брашед голд', image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=600' },
      { id: 'pl4', label: 'брашед роз голд', image: 'https://images.unsplash.com/photo-1620626011761-9963d7521476?auto=format&fit=crop&q=80&w=600' },
      { id: 'pl5', label: 'Ган грей', image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=600' }
    ]
  },
  {
    id: 'tileFormat',
    title: 'Формат керамогранита',
    question: 'Размер плитки (можно несколько):',
    isMulti: true,
    options: [
      { id: 'tf1', label: 'размер 1,20х0,60', description: 'цена от 15уе м2', image: 'https://images.unsplash.com/photo-1584622781564-1d9876a13d00?auto=format&fit=crop&q=80&w=600' },
      { id: 'tf2', label: 'размер 1,50х0,75', description: 'цена от 20уе м2', image: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&q=80&w=600' },
      { id: 'tf3', label: 'крупноформатный 3х1', description: 'от 100уе м2', image: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80&w=600' },
      { id: 'tf4', label: 'декоративная плитка', description: 'от 100уе м2', image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=600' }
    ]
  },
  {
    id: 'tileTexture',
    title: 'Текстура керамогранита',
    question: 'Тип поверхности (можно несколько):',
    isMulti: true,
    options: [
      { id: 'tt1', label: 'однотонная', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=600' },
      { id: 'tt2', label: 'контрастная', image: 'https://images.unsplash.com/photo-1600607687644-c7171bb3e29b?auto=format&fit=crop&q=80&w=600' },
      { id: 'tt3', label: 'Насыщенная', image: 'https://images.unsplash.com/photo-1600585154542-6379b9d20c2e?auto=format&fit=crop&q=80&w=600' }
    ]
  },
  {
    id: 'flooring',
    title: 'Напольное покрытие',
    question: 'Материал пола:',
    options: [
      { id: 'fl1', label: 'ламинат', description: 'от 10уе м2', image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&q=80&w=600' },
      { id: 'fl2', label: 'кварцвинил', description: 'от 25 уе м2', image: 'https://images.unsplash.com/photo-1622397333309-3056849bc70b?auto=format&fit=crop&q=80&w=600' },
      { id: 'fl3', label: 'Паркет инжинерная доска', description: 'от 70уе м2', image: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&q=80&w=600' },
      { id: 'fl4', label: 'Кавролан', description: 'от 15уе м2', image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f505?auto=format&fit=crop&q=80&w=600' }
    ]
  },
  {
    id: 'flooringTexture',
    title: 'Текстура напольного покрытия',
    question: 'Цветовой тон пола:',
    options: [
      { id: 'ft1', label: 'Светлая', image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6f3ea?auto=format&fit=crop&q=80&w=600' },
      { id: 'ft2', label: 'Темная', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600' }
    ]
  },
  {
    id: 'wallFinish',
    title: 'Отделка стен',
    question: 'Выберите варианты отделки (можно несколько):',
    isMulti: true,
    options: [
      { id: 'wf1', label: 'обои', image: 'https://images.unsplash.com/photo-1615529151169-7b1ff50dc7f2?auto=format&fit=crop&q=80&w=600' },
      { id: 'wf2', label: 'покраска', image: 'https://images.unsplash.com/photo-1562664377-709f225b0542?auto=format&fit=crop&q=80&w=600' },
      { id: 'wf3', label: 'декоративная штукатурка', image: 'https://images.unsplash.com/photo-1536640828551-73934f59346d?auto=format&fit=crop&q=80&w=600' },
      { id: 'wf4', label: 'Декор панели', image: 'https://images.unsplash.com/photo-1615876234886-fd9a39faa97f?auto=format&fit=crop&q=80&w=600' },
      { id: 'wf5', label: 'Зеркала', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600' },
      { id: 'wf6', label: 'Лофт', image: 'https://images.unsplash.com/photo-1536376074432-c6258d1b1ee3?auto=format&fit=crop&q=80&w=600' },
      { id: 'wf7', label: 'текстиль и матерчатые поверхности', image: 'https://images.unsplash.com/photo-1603126727210-9dd9359e1397?auto=format&fit=crop&q=80&w=600' }
    ]
  },
  {
    id: 'moldings',
    title: 'Молдинги и карнизы',
    question: 'Тип декора стен и потолка:',
    options: [
      { id: 'mc1', label: 'Строгие', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600' },
      { id: 'mc2', label: 'С узором', image: 'https://images.unsplash.com/photo-1615873968403-89e068628265?auto=format&fit=crop&q=80&w=600' },
      { id: 'mc3', label: 'Классические', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600' }
    ]
  },
  {
    id: 'lighting',
    title: 'Освещение',
    question: 'Выберите сценарии света:',
    isMulti: true,
    options: [
      { id: 'li1', label: 'точечные галогены', image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=600' },
      { id: 'li2', label: 'трековые светильники', image: 'https://images.unsplash.com/photo-1553095066-5014bc7b7f2d?auto=format&fit=crop&q=80&w=600' },
      { id: 'li3', label: 'бра', image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=600' },
      { id: 'li4', label: 'торшеры', image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=600' },
      { id: 'li5', label: 'люстры', image: 'https://images.unsplash.com/photo-1543013309-0d1f4edeb868?auto=format&fit=crop&q=80&w=600' }
    ]
  }
];

import React from 'react';
import { motion } from 'framer-motion';

interface InspirationItem {
  id: string;
  title: string;
  style: string;
  imageUrl: string;
}

const inspirations: InspirationItem[] = [
  { id: '1', title: 'Минимализм в деталях', style: 'Минимализм', imageUrl: 'https://picsum.photos/seed/minimalism/600/800' },
  { id: '2', title: 'Неоклассика с характером', style: 'Неоклассика', imageUrl: 'https://picsum.photos/seed/neoclassic/600/1000' },
  { id: '3', title: 'Скандинавский лакшери', style: 'Скандинавский', imageUrl: 'https://picsum.photos/seed/scandi/600/700' },
  { id: '4', title: 'Современный лофт', style: 'Лофт', imageUrl: 'https://picsum.photos/seed/loft/600/900' },
  { id: '5', title: 'Уютный прованс', style: 'Прованс', imageUrl: 'https://picsum.photos/seed/provence/600/800' },
  { id: '6', title: 'Хай-тек решение', style: 'Хай-тек', imageUrl: 'https://picsum.photos/seed/hitech/600/1100' },
];

const InspirationFeed: React.FC = () => {
  return (
    <section className="py-32 px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-bold text-[#2C3E50] mb-20 text-center serif tracking-tighter">
          Вдохновение для <span className="italic font-light text-orange-400">вашего дома</span>
        </h2>
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {inspirations.map((item) => (
            <div 
              key={item.id} 
              className="break-inside-avoid rounded-[2.5rem] overflow-hidden group relative shadow-sm hover:shadow-2xl transition-all duration-500"
            >
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-10 text-white">
                <p className="text-[10px] uppercase tracking-[0.3em] font-black mb-2 opacity-80">
                  {item.style}
                </p>
                <h3 className="text-2xl font-bold serif">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InspirationFeed;

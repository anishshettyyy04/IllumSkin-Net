import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const categories = [
  { id: 'foundation', title: 'Foundation', image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=800&auto=format&fit=crop' },
  { id: 'lipstick', title: 'Lipstick', image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop' },
  { id: 'blush', title: 'Blush', image: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?q=80&w=800&auto=format&fit=crop' },
  { id: 'eye', title: 'Eye Makeup', image: 'https://images.unsplash.com/photo-1583241475880-083f84372725?q=80&w=800&auto=format&fit=crop' },
];

export default function CategorySelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto flex flex-col">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-max mb-8"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>
      
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-light mb-4">What are you <span className="font-semibold text-indigo-400">shopping</span> for today?</h1>
        <p className="text-slate-400 text-lg">Select a category to begin your AI-powered virtual try-on.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div 
            key={cat.id}
            onClick={() => cat.id === 'foundation' ? navigate('/products') : navigate('/studio', { state: { category: cat.title } })}
            className={`group relative overflow-hidden rounded-2xl cursor-pointer h-80`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity group-hover:from-indigo-900/90"></div>
            <img 
              src={cat.image} 
              alt={cat.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute bottom-0 left-0 w-full p-6 z-20">
              <h3 className="text-2xl font-medium tracking-wide group-hover:text-indigo-200 transition-colors">{cat.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

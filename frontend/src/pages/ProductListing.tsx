import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Filter } from 'lucide-react';
import { formatINR } from '../utils/currency';

const mockProducts = [
  { id: 1, brand: 'Fenty Beauty', name: "Pro Filt'r Soft Matte", price: 40, hex: '#EED8C4', shade: '100' },
  { id: 2, brand: 'MAC', name: 'Studio Fix Fluid', price: 39, hex: '#DBB39B', shade: 'NW20' },
  { id: 3, brand: 'Maybelline', name: 'Fit Me Matte', price: 8.99, hex: '#CC9E7D', shade: '220' },
  { id: 4, brand: 'Fenty Beauty', name: "Pro Filt'r Soft Matte", price: 40, hex: '#73472E', shade: '420' },
  { id: 5, brand: 'MAC', name: 'Studio Fix Fluid', price: 39, hex: '#8C5938', shade: 'NC45' },
  { id: 6, brand: 'Maybelline', name: 'Fit Me Matte', price: 8.99, hex: '#4D2E24', shade: '360' },
];

export default function ProductListing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate('/categories')} 
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Categories
        </button>
        <button className="flex items-center gap-2 glass-button px-4 py-2 rounded-full text-sm">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>
      
      <div className="mb-12">
        <h1 className="text-4xl font-light mb-2">Foundation <span className="font-semibold text-indigo-400">Catalog</span></h1>
        <p className="text-slate-400">Select a product line to try on, or let our AI scan your face to match automatically.</p>
      </div>

      <div className="mb-8 p-6 glass-card border-indigo-500/30 bg-indigo-900/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-medium mb-1">Not sure what shade?</h2>
          <p className="text-sm text-slate-300">Jump straight into the studio and our AI will extract your albedo map in real-time.</p>
        </div>
        <button 
          onClick={() => navigate('/studio')}
          className="accent-button px-6 py-3 rounded-full whitespace-nowrap"
        >
          Auto-Match Me
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockProducts.map((p) => (
          <div 
            key={p.id}
            onClick={() => navigate('/studio')}
            className="glass-card p-4 cursor-pointer hover:border-indigo-500/50 transition-colors group"
          >
            <div className="aspect-square rounded-xl mb-4 bg-black/40 flex items-center justify-center relative overflow-hidden">
              <div className="w-20 h-20 rounded-full shadow-2xl" style={{ backgroundColor: p.hex }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                <span className="text-xs font-medium tracking-wider">TRY ON</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-indigo-300 font-medium tracking-wider uppercase">{p.brand}</p>
              <h3 className="font-medium text-lg leading-tight">{p.name}</h3>
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-slate-400">Shade: {p.shade}</p>
                <p className="font-semibold">{formatINR(p.price)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: '/corosal/hero1.jpg',
      title: 'John Wick: Chapter 3',
      subtitle: 'Legendary Hitman Returns'
    },
    {
      image: '/corosal/hero2.jpg',
      title: 'Epic Cinematic Universe',
      subtitle: 'The Greatest Stories Ever Told'
    },
    {
      image: '/corosal/hero3.jpg',
      title: 'Action Redefined',
      subtitle: 'Prepare for Adventure'
    },
    {
      image: '/corosal/hero4.jpg',
      title: 'Sci-Fi Masterpieces',
      subtitle: 'Beyond the Horizon'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-[3rem] mb-16 shadow-2xl group border border-white/10">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          }`}
        >
          {/* Blur background for low-res images */}
          <img
            src={slide.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-50 scale-125"
          />
          
          <div className="relative w-full h-full p-4">
            <div className="w-full h-full overflow-hidden rounded-[2rem] border border-white/10 relative">
              <img
                src={slide.image}
                alt={slide.title}
                className={`w-full h-full object-cover transition-transform duration-[10s] linear ${
                  index === currentSlide ? 'scale-110' : 'scale-100'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent" />
              <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 p-16 w-full z-20">
            <div className={`transition-all duration-1000 delay-300 ${
              index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <span className="inline-block px-4 py-1 rounded-full bg-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-widest mb-4">
                Now Previewing
              </span>
              <h2 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter drop-shadow-2xl">
                {slide.title}
              </h2>
              <p className="text-xl text-slate-300 font-medium mb-8">
                {slide.subtitle}
              </p>
              <div className="flex gap-4">
                <button className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-black hover:bg-yellow-400 transition-all shadow-xl shadow-white/5">
                  View Entry
                </button>
                <button className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-black hover:bg-white/20 transition-all border border-white/10">
                  Add to Watchlist
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-8 right-12 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1.5 transition-all duration-500 rounded-full ${
              i === currentSlide ? 'w-12 bg-yellow-500' : 'w-3 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;

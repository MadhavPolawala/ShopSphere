import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import banner_1 from "../data/banner_1.png"
import banner_2 from "../data/banner_2.png"
import banner_3 from "../data/banner_3.png"
import banner_4 from "../data/banner_4.png"

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const slides = [
  {
    image: banner_1,
    title: 'Elevate Everyday',
  subtitle: 'Curated Essentials',
  description: 'Handpicked products that blend quality, style, and functionality for modern living.',
  link: '/products',
  },
  {
    image: banner_3,
   title: 'What’s Trending Now',
  subtitle: 'Hot Picks & Bestsellers',
  description: 'Stay ahead of the curve with our most popular and fast-selling items.',
  link: '/products',
  },
  {
    image: banner_2,
     title: 'Less But Better',
  subtitle: 'Minimal Collection',
  description: 'Simple designs, powerful impact — essentials that never go out of style.',
  link: '/products',
  },
];

// Separate component so `animate` fires fresh per slide
const SlideContent = ({ slide, index }) => (
  <div className="relative h-full flex items-center px-6 md:px-20 lg:px-32">
    <div className="max-w-2xl text-white z-10 w-full ">
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20 bg-white/10 text-white/90 font-bold text-[10px] md:text-xs mb-4 md:mb-6 uppercase tracking-widest"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
        {slide.subtitle}
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.5 }}
        className="text-3xl sm:text-6xl lg:text-7xl font-black mb-3 md:mb-5 leading-[1.1] md:leading-[1.05] tracking-tighter drop-shadow-lg"
      >
        {slide.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34, duration: 0.45 }}
        className="text-sm md:text-lg text-white/75 mb-6 md:mb-10 leading-relaxed max-w-md md:max-w-lg"
      >
        {slide.description}
      </motion.p>

      {/* <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.44, duration: 0.4 }}
        className="flex items-center gap-5 flex-wrap"
      >
        <Link
          to={slide.link}
          className="group inline-flex items-center gap-2 bg-white dark:bg-blue-600 text-gray-900 dark:text-white px-6 md:px-8 py-3 md:py-3.5 rounded-xl md:rounded-2xl font-black text-sm md:text-base hover:shadow-2xl hover:shadow-black/30 dark:hover:bg-blue-700 active:scale-[0.97] transition-all duration-200"
        >
          {slide.buttonText}
          <ArrowRight size={16} className="md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div> */}
    </div>
  </div>
);

const HeroCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [key, setKey] = useState(0); // forces SlideContent to remount on slide change

  return (
    // Update your container div classes
    <div
      className="relative w-full rounded-3xl overflow-hidden mb-8 bg-black premium-shadow transition-all isolate"
      style={{
        height: 'clamp(320px, 45vh, 480px)',
        // This forces the browser to treat the container as a single layer
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
        backfaceVisibility: 'hidden',
        transform: 'translate3d(0, 0, 0)'
      }}
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        navigation={{
          nextEl: '.swiper-btn-next',
          prevEl: '.swiper-btn-prev',
        }}
        pagination={{
          clickable: true,
          el: '.swiper-custom-pagination',
          bulletClass: 'swiper-custom-bullet',
          bulletActiveClass: 'swiper-custom-bullet-active',
        }}
        autoplay={{ delay: 5500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.realIndex);
          setKey((k) => k + 1);
        }}
        loop
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full w-full">
              {/* // Update the img tag */}
              <img
                src={slide.image}
                alt={slide.title}
                // scale-[1.01] and -inset-[1px] ensures no white edges show around the image
                className="absolute -inset-[1px] w-[calc(100%+2px)] h-[calc(100%+2px)] object-cover scale-[1.02]"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              {/* Dual gradient for depth */}
              {/* Change inset-0 to -inset-[1px] to over-extend slightly */}
              <div className="absolute -inset-[1px] bg-gradient-to-r from-black/80 dark:from-black/95 via-black/40 to-black/10 z-0" />
              <div className="absolute -inset-[1px] bg-gradient-to-t from-black/60 via-transparent to-transparent z-0" />


              <SlideContent slide={slide} index={key} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Prev/Next Buttons */}
      <button
        className="swiper-btn-prev hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white items-center justify-center hover:bg-white/25 active:scale-90 transition-all font-bold"
        aria-label="Previous slide"
      >
        <ChevronRight size={20} className="rotate-180" />
      </button>
      <button
        className="swiper-btn-next hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white items-center justify-center hover:bg-white/25 active:scale-90 transition-all font-bold"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      {/* Pill Pagination */}
      <div className="swiper-custom-pagination absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2" />

      {/* Slide Counter */}
      <div className="absolute bottom-7 right-8 z-20 font-mono text-white/50 text-xs font-bold tabular-nums tracking-widest">
        {String(activeIndex + 1).padStart(2, '0')}&nbsp;/&nbsp;{String(slides.length).padStart(2, '0')}
      </div>

      <style>{`
        .swiper-custom-bullet {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(255,255,255,0.35);
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .swiper-custom-bullet-active {
          width: 30px;
          background: rgba(255,255,255,0.9);
        }
      `}</style>
    </div>
  );
};

export default HeroCarousel;

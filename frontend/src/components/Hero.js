import React from 'react';
import HeroSlider, { Slide, Nav } from 'hero-slider';
import '../css/Hero.css';
import image1 from '../images/slideshow/image1.png';
import image2 from '../images/slideshow/image2.png';
import image3 from '../images/slideshow/image3.png';
import image4 from '../images/slideshow/image4.png';

const Hero = () => {
  return (
    <div className="hero">
      <HeroSlider
        slidingAnimation="left_to_right"
        orientation="horizontal"
        initialSlide={1}
        onBeforeChange={(previousSlide, nextSlide) =>
          console.log(`onBeforeChange ${previousSlide} ${nextSlide}`)
        }
        onChange={nextSlide => console.log(`onChange ${nextSlide}`)}
        onAfterChange={nextSlide => console.log(`onAfterChange ${nextSlide}`)}
        settings={{
          slidingDuration: 500,
          slidingDelay: 100,
          shouldAutoplay: true,
          shouldDisplayButtons: true,
          autoplayDuration: 5000,
          height: '50vh',
          isInfinite: true,
        }}
      >
        <Slide
          background={{
            backgroundImageSrc: image1,
            backgroundAttachment: 'center center',
          }}
        >
          <div className="hero-slide-content">
            <h2>Slide 1 Title</h2>
            <p>Slide 1 Description</p>
          </div>
        </Slide>
        <Slide
          background={{
            backgroundImageSrc: image2,
            backgroundAttachment: 'center center',
          }}
        >
          <div className="hero-slide-content">
            <h2>Slide 2 Title</h2>
            <p>Slide 2 Description</p>
          </div>
        </Slide>
        <Slide
          background={{
            backgroundImageSrc: image3,
            backgroundAttachment: 'center center',
          }}
        >
          <div className="hero-slide-content">
            <h2>Slide 3 Title</h2>
            <p>Slide 3 Description</p>
          </div>
        </Slide>
        <Slide
          background={{
            backgroundImageSrc: image4,
            backgroundAttachment: 'center center',
          }}
        >
          <div className="hero-slide-content">
            <h2>Slide 4 Title</h2>
            <p>Slide 4 Description</p>
          </div>
        </Slide>
        <Nav className="hero-slider-previous-button" direction="previous">
          <span>&#8592;</span> {/* Use the left arrow entity */}
        </Nav>
        <Nav className="hero-slider-next-button" direction="next">
          <span>&#8594;</span> {/* Use the right arrow entity */}
        </Nav>
      </HeroSlider>
    </div>
  );
};

export default Hero;
import { useEffect, useState } from 'react';

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions(),
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}

export default function Hero({ image, className }) {
  const { width } = useWindowDimensions();
  let iWidth = 'w300';
  let style = {};

  if (!image) style = {};
  if (width > 300) iWidth = 'w1280';
  if (width > 780) iWidth = 'w1280';
  if (width > 1400) iWidth = 'original';
  if (image)
    style = {
      backgroundImage: `url(https://image.tmdb.org/t/p/${iWidth}${image})`,
    };
  return <div className={className} style={style}></div>;
}

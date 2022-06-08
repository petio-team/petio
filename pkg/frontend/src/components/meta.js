import { useEffect } from 'react';

export default function Meta(props) {
  useEffect(() => {
    document.title = `Petio - ${props.title}`;
  }, [props]);
  return null;
}

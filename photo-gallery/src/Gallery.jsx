import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, Camera } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';

const API = 'https://picsum.photos/v2/list';

function PhotoCard({ photo }) {
  const [likes, setLikes] = useState(0);
  const [imageSrc, setImageSrc] = useState(photo.download_url);
  const [fallbackTried, setFallbackTried] = useState(false);
  const [broken, setBroken] = useState(false);

  function handleImageError() {
    if (!fallbackTried) {
      setFallbackTried(true);
      setImageSrc(`https://picsum.photos/id/${encodeURIComponent(photo.id)}/900/650`);
    } else {
      setBroken(true);
    }
  }

  return (
    <article className="photo-card">
      <div className="photo-frame">
        {!broken ? <img src={imageSrc} alt={`Photograph by ${photo.author}`} loading="lazy" onError={handleImageError} /> :
          <div className="image-fallback"><Camera size={34}/><span>Image unavailable</span><a href={photo.download_url} target="_blank" rel="noreferrer">Open original image</a></div>}
      </div>
      <div className="photo-meta">
        <div><span className="eyebrow">PHOTOGRAPHER</span><h2>{photo.author || 'Unknown author'}</h2></div>
        <button className={`like-button ${likes ? 'liked' : ''}`} onClick={() => setLikes(n => n + 1)} aria-label={`Like photo, ${likes} likes`}>
          <FontAwesomeIcon icon={faThumbsUp} /> <span>{likes}</span>
        </button>
      </div>
    </article>
  );
}

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const sentinel = useRef(null);
  const loadingRef = useRef(false);

  const loadPage = useCallback(async (pageToLoad) => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API}?page=${pageToLoad}&limit=10`);
      if (!response.ok) throw new Error(`Unable to load photos (HTTP ${response.status}).`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Unexpected response from photo service.');
      setPhotos(current => {
        const known = new Set(current.map(photo => String(photo.id)));
        return [...current, ...data.filter(photo => !known.has(String(photo.id)))];
      });
      setHasMore(data.length > 0);
      setPage(pageToLoad + 1);
    } catch (err) {
      setError(err.message || 'Something went wrong while loading photos.');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore]);

  useEffect(() => { loadPage(1); }, []); // Initial page only.

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingRef.current) loadPage(page);
    }, { rootMargin: '500px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [page, hasMore, loadPage]);

  return (
    <main className="page-shell">
      <header className="site-header">
        <div className="brand-mark"><Camera size={22}/></div>
        <div><p className="eyebrow">DISCOVER & EXPLORE</p><h1>Photo Gallery</h1></div>
      </header>
      <section className="intro"><p>A little inspiration, one photograph at a time.</p><span>{photos.length} photos loaded</span></section>
      <section className="gallery" aria-label="Photo gallery">
        {photos.map(photo => <PhotoCard key={photo.id} photo={photo} />)}
      </section>
      <div ref={sentinel} className="load-area">
        {loading && <><span className="spinner"/><span>Loading more photos…</span></>}
        {error && <div className="error-panel"><p>{error}</p><button onClick={() => loadPage(page)}><RefreshCw size={16}/> Try again</button></div>}
        {!loading && !error && hasMore && photos.length > 0 && <button className="load-button" onClick={() => loadPage(page)}>Load more photos</button>}
        {!hasMore && photos.length > 0 && <p className="end-message">You’ve reached the end of the gallery.</p>}
      </div>
      <footer>Images provided by <a href="https://picsum.photos/" target="_blank" rel="noreferrer">Lorem Picsum</a></footer>
    </main>
  );
}

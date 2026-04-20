function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="loading-screen">
      <div className="loading-screen__orb" />
      <div className="loading-screen__panel">
        <div className="loading-screen__spinner" />
        <p>{message}</p>
      </div>
    </div>
  );
}

export default LoadingScreen;

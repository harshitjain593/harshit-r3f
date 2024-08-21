import { Canvas } from '@react-three/fiber';
import { Experience } from './components/Experience';

function App() {
    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 10, 25], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Experience />
      </Canvas>

      {/* Description */}
      <div
        id="description"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          background: 'white',
          padding: '10px',
          display: 'none', // Default hidden, will be managed by Experience component
        }}
      >
        {/* Description text will be updated by Experience component */}
      </div>
    </div>
    );
}

export default App;


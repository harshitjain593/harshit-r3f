import { OrbitControls } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Model } from "./Model";
import * as YUKA from "yuka";
import { Raycaster, Vector2 } from "three";

const buildingGeometry = new THREE.BoxGeometry(3, 6, 3);
const colors = [
  0xff0000, // Red
  0x00ff00, // Green
  0x0000ff, // Blue
  0xffff00, // Yellow
];

const descriptions = [
  "This is Building 1, it is red and located in the bottom-left corner.",
  "This is Building 2, it is green and located in the bottom-right corner.",
  "This is Building 3, it is blue and located in the top-right corner.",
  "This is Building 4, it is yellow and located in the top-left corner.",
];

// Define the path and vehicle
const path = new YUKA.Path();
path.add(new YUKA.Vector3(-10.5, 0, -10.5));
path.add(new YUKA.Vector3(10.5, 0, -10.5));
path.add(new YUKA.Vector3(10.5, 0, 10.5));
path.add(new YUKA.Vector3(-10.5, 0, 10.5));
path.loop = true;

export const Experience = () => {
  const [description, setDescription] = useState('');
  const [intersectedObject, setIntersectedObject] = useState(null);

  const cameraRef = useRef();
  const directionalLightRef = useRef();
  const vehicleRef = useRef();
  const obstacleRef = useRef();
  const raycaster = new Raycaster();
  const mouse = new Vector2();
  
  const buildings = [];

  useEffect(() => {
    const time = new YUKA.Time();
    const entityManager = new YUKA.EntityManager();

    console.log("Initializing vehicle...");

    const vehicle = new YUKA.Vehicle();
    vehicle.position.set(-10.5, 0, -10.5);
    const followPathBehavior = new YUKA.FollowPathBehavior(path, 2);
    vehicle.steering.add(followPathBehavior);

    const onPathBehavior = new YUKA.OnPathBehavior(path);
    vehicle.steering.add(onPathBehavior);
    vehicle.maxSpeed = 5;

    const sync = () => {
      const vehicleMesh = vehicleRef.current;
      if (vehicleMesh) {
        vehicleMesh.position.copy(vehicle.position);

        const velocity = vehicle.velocity;
        const angle = Math.atan2(velocity.x, velocity.z);
        vehicleMesh.rotation.y = angle;

        // Compute the bounding radius
        const boundingBox = new THREE.Box3().setFromObject(vehicleMesh);
        const boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere());
        vehicle.boundingRadius = boundingSphere.radius;
      }
    };

    // Obstacle setup
    const obstacleGeometry = new THREE.BoxGeometry(1, 1, 1);
    const obstacleMesh = new THREE.Mesh(
      obstacleGeometry,
      new THREE.MeshStandardMaterial({ color: 0xee0808 })
    );
    obstacleMesh.position.set(-10.5, 0, 0);
    const obstacle = new YUKA.GameEntity();
    obstacle.position.copy(obstacleMesh.position);
    obstacleRef.current = obstacle;
    const boundingBox = new THREE.Box3().setFromObject(obstacleMesh);
    const boundingSphere = boundingBox.getBoundingSphere(new THREE.Sphere());
    obstacle.boundingRadius = boundingSphere.radius;
    console.log(obstacle.boundingRadius);
    const obstacleAvoidanceBehavior = new YUKA.ObstacleAvoidanceBehavior([obstacle]);
    obstacleAvoidanceBehavior.detectionBoxLength = 3; // Increase detection range
    vehicle.steering.add(obstacleAvoidanceBehavior);

    // Traffic light detection
    let stopTime = null;
    let isStopped = false;
    const stopDuration = 3; // 3 seconds

    const checkTrafficLight = () => {
      const vehiclePosition = vehicle.position;
      const distanceToTrafficLight = vehiclePosition.distanceTo(new THREE.Vector3(0, 1.5, 10.5));

      console.log("Checking traffic light. Distance:", distanceToTrafficLight);

      if (distanceToTrafficLight < 5) {
        console.log("Stopping...");
        isStopped = true;
        stopTime = time.getElapsed() + stopDuration;
        vehicle.maxSpeed = 0; // Stop the vehicle
        vehicle.velocity.set(0, 0, 0);
      }

      if (isStopped && time.getElapsed() > stopTime) {
        console.log("Resuming vehicle movement...");
        vehicle.maxSpeed = 5; // Set to original speed
        isStopped = false;
      }
    };

    const clickHandler = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObjects(buildings);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        setIntersectedObject(object);
        const targetCameraPosition = object.position.clone().add(new THREE.Vector3(0, 15, 20));
        setDescription(object.userData.description);
        cameraRef.current.position.copy(targetCameraPosition);
        cameraRef.current.lookAt(object.position);
      } else {
        setDescription('');
      }
    };

    document.addEventListener('click', clickHandler);

    entityManager.add(vehicle);
    entityManager.add(obstacle);

    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      checkTrafficLight(); // Check traffic light position before adjusting speed

      const delta = clock.getDelta();
      entityManager.update(delta); // Update only when the vehicle is not stopped

      sync();
    };
    animate();

    return () => {
      document.removeEventListener('click', clickHandler);
      clock.stop();
    };
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        ref={directionalLightRef}
        intensity={2}
        position={[10, 10, 10]}
        castShadow
      />
      {directionalLightRef.current && (
        <primitive
          object={
            new THREE.DirectionalLightHelper(directionalLightRef.current, 1)
          }
        />
      )}
      <OrbitControls enableZoom={true} enableRotate={true} enablePan={true} />

      {/* Plane */}
      <mesh position={[0, 0, 0]} rotation-x={-0.5 * Math.PI}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color={0xaaaaaa} />
      </mesh>

      {/* Roads */}
      <mesh
        position={[0, 0.01, -10.5]}
        geometry={new THREE.PlaneGeometry(23, 2)}
        material={new THREE.MeshStandardMaterial({ color: 0x333333 })}
        rotation-x={-0.5 * Math.PI}
      />
      <mesh
        position={[0, 0.01, 10.5]}
        geometry={new THREE.PlaneGeometry(23, 2)}
        material={new THREE.MeshStandardMaterial({ color: 0x333333 })}
        rotation-x={-0.5 * Math.PI}
      />
      <mesh
        position={[-10.5, 0.01, 0]}
        geometry={new THREE.PlaneGeometry(23, 2)}
        material={new THREE.MeshStandardMaterial({ color: 0x333333 })}
        rotation-x={-0.5 * Math.PI}
        rotation-z={Math.PI / 2}
      />
      <mesh
        position={[10.5, 0.01, 0]}
        geometry={new THREE.PlaneGeometry(23, 2)}
        material={new THREE.MeshStandardMaterial({ color: 0x333333 })}
        rotation-x={-0.5 * Math.PI}
        rotation-z={Math.PI / 2}
      />

      {/* Buildings */}
      {colors.map((color, index) => (
        <mesh
          key={index}
          position={[
            index % 2 === 0 ? -13.5 : 13.5,
            3,
            index < 2 ? -13.5 : 13.5,
          ]}
          geometry={buildingGeometry}
          material={new THREE.MeshStandardMaterial({ color })}
          userData={{ description: descriptions[index] }}
          ref={(ref) => {
            if (ref) {
              buildings.push(ref);
            }
          }}
        />
      ))}

      {/* Obstacle */}
      <mesh ref={obstacleRef} position={[-10.5, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={0xee0808} />
      </mesh>

      {/* Traffic Light Pole */}
      <mesh position={[0, 1.5, 10.5]}>
        <cylinderGeometry args={[0.1, 0.1, 3, 32]} />
        <meshStandardMaterial color={0xffffff} />
      </mesh>

      {/* Traffic Light (Red Light) */}
      <mesh position={[0, 2.5, 10.5]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={0xff0000} />
      </mesh>

      <Model ref={vehicleRef} position={[-10.5, 0, -10.5]} scale={0.01} />

      {/* Description Box */}
      {description && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0px 0px 10px rgba(0,0,0,0.5)',
        }}>
          {description}
        </div>
      )}
    </>
  );
};

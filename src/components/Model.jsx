/* eslint-disable react/no-unknown-property */
/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/
import { forwardRef } from 'react';
import { useGLTF } from '@react-three/drei';

export const Model = forwardRef((props, ref) => {
  const { nodes, materials } = useGLTF('./models/car.glb');
  return (
    <group ref={ref} {...props} dispose={null} scale={0.01}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Lamborghini_Aventador_Body.geometry}
        material={materials._Lamborghini_AventadorLamborghini_Aventador_BodySG}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Lamborghini_Aventador_Glass.geometry}
        material={materials._Lamborghini_AventadorLamborghini_Aventador_GlassSG}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Lamborghini_Aventador_Wheel_FL.geometry}
        material={materials._Lamborghini_AventadorLamborghini_Aventador_BodySG}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Lamborghini_Aventador_Wheel_FR.geometry}
        material={materials._Lamborghini_AventadorLamborghini_Aventador_BodySG}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Lamborghini_Aventador_Wheel_RL.geometry}
        material={materials._Lamborghini_AventadorLamborghini_Aventador_BodySG}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Lamborghini_Aventador_Wheel_RR.geometry}
        material={materials._Lamborghini_AventadorLamborghini_Aventador_BodySG}
      />
    </group>
  );
});

useGLTF.preload('./models/car.glb');

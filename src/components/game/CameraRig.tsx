import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

type CameraRigProps = {
  targetRef: React.MutableRefObject<THREE.Vector3>;
};

export default function CameraRig({ targetRef }: CameraRigProps) {
  const { camera } = useThree();
  const desiredPos = useRef(new THREE.Vector3(0, 15, 20));

  useFrame(() => {
    const target = targetRef.current;
    desiredPos.current.set(target.x, target.y + 12, target.z + 16);
    camera.position.lerp(desiredPos.current, 0.06);
    camera.lookAt(target.x, target.y + 1, target.z);
  });

  return null;
}

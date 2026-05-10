type Vector3Tuple = [number, number, number];

const anchors = new Map<string, Vector3Tuple>();

export function setSceneAnchor(id: string, position: Vector3Tuple) {
  // Scene anchors update every frame, so they live outside React state.
  anchors.set(id, position);
}

export function getSceneAnchor(id: string | null) {
  if (!id) {
    return null;
  }

  return anchors.get(id) ?? null;
}

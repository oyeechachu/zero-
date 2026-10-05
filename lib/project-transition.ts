const transitionStorageKey = 'zero-degree-project-transition';

type ProjectTransitionRecord = {
  slug: string;
  image: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

export function saveProjectTransition(slug: string, image: string, bounds: DOMRect) {
  const record: ProjectTransitionRecord = {
    slug,
    image,
    left: bounds.left,
    top: bounds.top,
    width: bounds.width,
    height: bounds.height,
  };

  try {
    sessionStorage.setItem(transitionStorageKey, JSON.stringify(record));
  } catch (error) {
    console.error('Project transition state could not be saved', error);
  }
}

export function consumeProjectTransition(slug: string): ProjectTransitionRecord | null {
  try {
    const stored = sessionStorage.getItem(transitionStorageKey);
    if (!stored) return null;
    sessionStorage.removeItem(transitionStorageKey);

    const record: unknown = JSON.parse(stored);
    if (!record || typeof record !== 'object') return null;

    const value = record as Partial<ProjectTransitionRecord>;
    if (
      value.slug !== slug ||
      typeof value.image !== 'string' ||
      typeof value.left !== 'number' ||
      typeof value.top !== 'number' ||
      typeof value.width !== 'number' ||
      typeof value.height !== 'number' ||
      value.width <= 0 ||
      value.height <= 0
    ) return null;

    return value as ProjectTransitionRecord;
  } catch (error) {
    console.error('Project transition state could not be read', error);
    return null;
  }
}

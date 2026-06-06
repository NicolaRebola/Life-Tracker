export type TagPrimitives = {
  name: string;
  label: string;
};

export class Tag {
  private constructor(
    public readonly name: string,
    public readonly label: string,
  ) {}

  static fromLabel(label: string): Tag | null {
    const normalizedLabel = label.trim();
    const name = normalizedLabel.toLowerCase();

    if (!name) return null;

    return new Tag(name, normalizedLabel);
  }

  static uniqueFromLabels(labels: string[] = []): Tag[] {
    const tagsByName = new Map<string, Tag>();

    labels.forEach((label) => {
      const tag = Tag.fromLabel(label);
      if (tag) tagsByName.set(tag.name, tag);
    });

    return Array.from(tagsByName.values());
  }

  static rehydrate(props: TagPrimitives): Tag {
    return new Tag(props.name, props.label);
  }

  toPrimitives(): TagPrimitives {
    return {
      name: this.name,
      label: this.label,
    };
  }
}

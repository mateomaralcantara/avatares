type SectionCardProps = {
    title: string;
    description: string;
  };
  
  export function SectionCard({ title, description }: SectionCardProps) {
    return (
      <article className="card">
        <h3>{title}</h3>
        <p>{description}</p>
      </article>
    );
  }
  
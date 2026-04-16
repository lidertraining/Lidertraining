import { cn } from '@lib/cn';

interface MarkdownProps {
  source: string;
  className?: string;
}

/**
 * Renderizador de markdown minimalista — cobre o que aparece no conteúdo da
 * Jornada e do FIR: parágrafos, **negrito**, títulos ###, listas ordenadas/não
 * ordenadas e citações > . Sem dependência externa.
 */
export function Markdown({ source, className }: MarkdownProps) {
  const blocks = parseBlocks(source);

  return (
    <div className={cn('flex flex-col gap-3 text-sm leading-relaxed text-on-2', className)}>
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
}

type Block =
  | { kind: 'h3'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'quote'; text: string };

function parseBlocks(src: string): Block[] {
  const lines = src.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;
    const trimmed = line.trim();

    if (trimmed === '') {
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      blocks.push({ kind: 'h3', text: trimmed.slice(4) });
      i++;
      continue;
    }

    if (trimmed.startsWith('> ')) {
      blocks.push({ kind: 'quote', text: trimmed.slice(2) });
      i++;
      continue;
    }

    if (/^[*-]\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[*-]\s/.test(lines[i]!.trim())) {
        items.push(lines[i]!.trim().replace(/^[*-]\s/, ''));
        i++;
      }
      blocks.push({ kind: 'ul', items });
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i]!.trim())) {
        items.push(lines[i]!.trim().replace(/^\d+\.\s/, ''));
        i++;
      }
      blocks.push({ kind: 'ol', items });
      continue;
    }

    // parágrafo — junta linhas consecutivas
    const buf: string[] = [trimmed];
    i++;
    while (
      i < lines.length &&
      lines[i]!.trim() !== '' &&
      !lines[i]!.trim().startsWith('### ') &&
      !lines[i]!.trim().startsWith('> ') &&
      !/^[*-]\s/.test(lines[i]!.trim()) &&
      !/^\d+\.\s/.test(lines[i]!.trim())
    ) {
      buf.push(lines[i]!.trim());
      i++;
    }
    blocks.push({ kind: 'p', text: buf.join(' ') });
  }

  return blocks;
}

function renderBlock(block: Block, i: number) {
  switch (block.kind) {
    case 'h3':
      return (
        <h3 key={i} className="serif mt-2 text-base font-bold text-on">
          {renderInline(block.text)}
        </h3>
      );
    case 'p':
      return (
        <p key={i} className="text-sm text-on-2">
          {renderInline(block.text)}
        </p>
      );
    case 'ul':
      return (
        <ul key={i} className="ml-5 flex list-disc flex-col gap-1 text-sm text-on-2">
          {block.items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={i} className="ml-5 flex list-decimal flex-col gap-1 text-sm text-on-2">
          {block.items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ol>
      );
    case 'quote':
      return (
        <blockquote
          key={i}
          className="rounded-card border-l-2 border-am bg-sf-top/50 px-3 py-2 text-sm italic text-on-2"
        >
          {renderInline(block.text)}
        </blockquote>
      );
  }
}

/** Suporta **negrito** inline. */
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={key++} className="font-semibold text-on">
        {match[1]}
      </strong>,
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

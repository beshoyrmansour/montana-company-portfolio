import { Box, Building2, Truck } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Product } from '@/schemas/product';

interface PackagingTableProps {
  packaging: Product['packaging'];
  title: string;
  labels: {
    type: string;
    weight: string;
    perCarton: string;
  };
}

const TYPE_META: Record<Product['packaging'][number]['type'], { icon: typeof Box; tint: string }> =
  {
    retail: { icon: Box, tint: 'text-brand-primary' },
    foodservice: { icon: Building2, tint: 'text-brand-orange' },
    bulk: { icon: Truck, tint: 'text-brand-secondary' },
  };

export function PackagingTable({ packaging, title, labels }: PackagingTableProps) {
  if (packaging.length === 0) return null;

  return (
    <div>
      <h2 className="text-display mb-6 font-bold">{title}</h2>

      {/* Mobile: stacked cards */}
      <ul className="grid grid-cols-1 gap-3 md:hidden">
        {packaging.map((pkg, idx) => {
          const meta = TYPE_META[pkg.type];
          const Icon = meta.icon;
          return (
            <li key={idx} className="border-border bg-surface rounded-lg border p-4">
              <div className="mb-3 flex items-center gap-2">
                <Icon className={cn('h-5 w-5', meta.tint)} aria-hidden />
                <span className="text-body-sm font-semibold capitalize">{pkg.type}</span>
              </div>
              <div className="text-body-sm grid grid-cols-2 gap-3">
                <div>
                  <p className="text-caption text-text-subtle tracking-wider uppercase">
                    {labels.weight}
                  </p>
                  <p className="font-mono font-semibold" dir="ltr">
                    {pkg.weight}
                  </p>
                </div>
                <div>
                  <p className="text-caption text-text-subtle tracking-wider uppercase">
                    {labels.perCarton}
                  </p>
                  <p className="font-mono font-semibold" dir="ltr">
                    {pkg.perCarton}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop: proper table */}
      <div className="border-border hidden overflow-hidden rounded-lg border md:block">
        <table className="w-full">
          <thead>
            <tr className="bg-surface-muted">
              <th className="text-caption text-text-muted px-6 py-4 text-start font-semibold tracking-wider uppercase">
                {labels.type}
              </th>
              <th className="text-caption text-text-muted px-6 py-4 text-start font-semibold tracking-wider uppercase">
                {labels.weight}
              </th>
              <th className="text-caption text-text-muted px-6 py-4 text-start font-semibold tracking-wider uppercase">
                {labels.perCarton}
              </th>
            </tr>
          </thead>
          <tbody className="divide-border bg-surface divide-y">
            {packaging.map((pkg, idx) => {
              const meta = TYPE_META[pkg.type];
              const Icon = meta.icon;
              return (
                <tr key={idx} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Icon className={cn('h-5 w-5', meta.tint)} aria-hidden />
                      <span className="font-semibold capitalize">{pkg.type}</span>
                    </div>
                  </td>
                  <td className="text-body px-6 py-4 font-mono" dir="ltr">
                    {pkg.weight}
                  </td>
                  <td className="text-body px-6 py-4 font-mono" dir="ltr">
                    {pkg.perCarton}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

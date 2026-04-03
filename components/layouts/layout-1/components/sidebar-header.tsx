import { ChevronFirst } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLayout } from './context';
import Link from 'next/link';

export function SidebarHeader() {
  const { sidebarCollapse, setSidebarCollapse } = useLayout();

  const handleToggleClick = () => {
    setSidebarCollapse(!sidebarCollapse);
  };

  return (
    <div className="sidebar-header hidden lg:flex items-center relative justify-between px-4 lg:px-6 shrink-0 h-[70px]">
      <Link href="/admin">
        {sidebarCollapse ? (
            <span className="text-xl font-bold text-foreground">
              C<span className="text-primary">O</span>
            </span>
        ) : (
            <span className="text-2xl font-bold tracking-tight text-foreground transition-all">
              Church<span className="text-primary">OS</span>
            </span>
        )}
      </Link>
      <Button
        onClick={handleToggleClick}
        size="sm"
        mode="icon"
        variant="outline"
        className={cn(
          'size-7 absolute start-full top-2/4 rtl:translate-x-2/4 -translate-x-2/4 -translate-y-2/4 bg-background',
          sidebarCollapse ? 'ltr:rotate-180' : 'rtl:rotate-180',
        )}
      >
        <ChevronFirst className="size-4!" />
      </Button>
    </div>
  );
}

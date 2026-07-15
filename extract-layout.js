const fs = require('fs');

try {
    const content = fs.readFileSync('app/admin/page.tsx', 'utf-8');

    // Extract necessary parts of the file manually by strings
    // Types
    const importsEnd = content.indexOf('type NavChild');
    const typesEnd = content.indexOf('const statCards');

    // Function SidebarItem
    const sidebarItemStart = content.indexOf('function SidebarItem');
    const statBadgeStart = content.indexOf('function StatBadge');

    // React component
    const pageComponentStart = content.indexOf('export default function EcommerceAdminDashboard');
    const sidebarLayoutCodeStart = content.indexOf('<div className="min-h-screen');
    const contentAreaStart = content.indexOf('<div className="px-4 py-5 md:px-6 xl:px-8">');

    const mainCloseIdx = content.lastIndexOf('</main>');

    const importsCode = content.substring(0, importsEnd);
    const typesCode = content.substring(importsEnd, typesEnd);

    // Create layout.tsx
    const layoutContent = `\${importsCode}
\${typesCode}
\${content.substring(sidebarItemStart, statBadgeStart)}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
\${content.substring(pageComponentStart + 51, sidebarLayoutCodeStart).trim()}
  return (
    \${content.substring(sidebarLayoutCodeStart, contentAreaStart).trim()}
          <div className="px-4 py-5 md:px-6 xl:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
`;

    // Create new page.tsx
    const dataArrays = content.substring(typesEnd, sidebarItemStart);
    const smallCards = content.substring(statBadgeStart, pageComponentStart);
    const pageInner = content.substring(contentAreaStart + 43, mainCloseIdx).trim();

    const pageContent = `import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CreditCard,
  DollarSign,
  Eye,
  FileText,
  Grid2X2,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Moon,
  MoreVertical,
  Package,
  Percent,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Store,
  Tag,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";

\${typesCode}

\${dataArrays}

\${smallCards}

export default function EcommerceAdminDashboard() {
  return (
    <>
      \${pageInner}
    </>
  );
}
`;

    fs.writeFileSync('app/admin/layout.tsx', layoutContent);
    fs.writeFileSync('app/admin/page.tsx', pageContent);

    console.log('Layout extracted successfully');
} catch (error) {
    console.error(error);
}

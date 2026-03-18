import type { ReactNode } from 'react';
import React from 'react';
import { useCVStore } from '../../store/cvStore';

interface A4PageProps {
  children: ReactNode;
  scale?: number;
  isPreview?: boolean;
}

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
export const PADDING_MM = 15;

export const A4Page = ({ children, scale = 1, isPreview = true }: A4PageProps) => {
  const { styleConfig } = useCVStore();
  const isSidebarTheme = styleConfig.theme === 'Modern Sidebar';

  // Extract columns for Sidebar theme
  const sidebarElements: ReactNode[] = [];
  const mainElements: ReactNode[] = [];

  if (isSidebarTheme) {
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        // We use the sectionType prop passed by LayoutEngine
        const type = (child.props as any).sectionType;
        if (['PersonalInfo', 'Skills', 'Education'].includes(type)) {
          sidebarElements.push(React.cloneElement(child, { isInSidebar: true } as any));
        } else {
          mainElements.push(React.cloneElement(child, { isInSidebar: false } as any));
        }
      }
    });
  }

  return (
    <div
      className={`bg-white mx-auto relative overflow-hidden flex flex-row ${
        isPreview ? 'shadow-xl mb-8' : 'shadow-none mb-0'
      } print:shadow-none print:mb-0`}
      style={{
        width: `${A4_WIDTH_MM}mm`,
        height: `${A4_HEIGHT_MM}mm`,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
        pageBreakAfter: 'always',
        breakAfter: 'page',
      }}
    >
      {/* Sidebar background block for Sidebar theme */}
      {isSidebarTheme && (
        <div
          className="absolute left-0 top-0 bottom-0 z-0 h-full"
          style={{
            width: '60mm',
            backgroundColor: styleConfig.primaryColor,
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        />
      )}

      {/* Content Area */}
      <div
        className="relative z-10 w-full h-full box-border"
        style={{ padding: `${PADDING_MM}mm` }}
      >
        {isSidebarTheme ? (
          <div className="flex h-full w-full gap-4">
            <div className="w-[45mm] flex flex-col gap-4 text-white">
              {sidebarElements}
            </div>
            <div className="flex-1 flex flex-col gap-4">
              {mainElements}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col pt-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

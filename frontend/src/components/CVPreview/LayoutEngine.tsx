import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import { useCVStore } from '../../store/cvStore';
import { A4Page, A4_HEIGHT_MM, A4_WIDTH_MM, PADDING_MM } from './A4Page';
import { SectionRenderer } from './SectionRenderer';

const DPI = 96;
const MM_TO_PX = DPI / 25.4;
const USABLE_HEIGHT_PX = Math.floor((A4_HEIGHT_MM - (PADDING_MM * 2)) * MM_TO_PX);

interface LayoutEngineProps {
  scale?: number;
  isPreview?: boolean;
}

interface PageElement {
  sectionId: string;
  sectionType: string;
  itemId?: string;
  isHeader?: boolean;
  node: React.ReactElement;
}

interface PageGroup {
  id: string;
  elements: PageElement[];
}

export const LayoutEngine: React.FC<LayoutEngineProps> = ({ scale = 1, isPreview = true }) => {
  const { sections, styleConfig } = useCVStore();
  const offscreenRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PageGroup[]>([]);
  const [isMeasuring, setIsMeasuring] = useState(true);

  // Two-phase layout: 1) Measure 2) Paginate
  useEffect(() => {
    let isMounted = true;
    // Always reset to false at the start of a new effect cycle
    (window as any).RENDER_COMPLETE = false;

    const measureAndPaginate = async () => {
      // Check for hydration data from Puppeteer (injected via evaluateOnNewDocument)
      if (!isPreview && (window as any).CV_HYDRATION_DATA) {
        const data = (window as any).CV_HYDRATION_DATA;
        // Clear to avoid infinite loop on next cycle
        delete (window as any).CV_HYDRATION_DATA;
        useCVStore.setState(data);
        // Important: Stop this cycle; the setState will trigger a re-render and a fresh effect cycle
        return;
      }

      // Wait for fonts to be fully loaded before measuring
      await document.fonts.ready;
      if (!isMounted) return;

      // Small delay to let the browser settle after React render + font load
      setTimeout(() => {
        if (!offscreenRef.current || !isMounted) return;

        const isSidebarTheme = styleConfig.theme === 'Modern Sidebar';
        const measureLayer = offscreenRef.current;
        const newPages: PageGroup[] = [{ id: 'page-0', elements: [] }];

        // Helper to get or create a page
        const ensurePage = (index: number) => {
          while (newPages.length <= index) {
            newPages.push({ id: `page-${newPages.length}`, elements: [] });
          }
        };

        if (isSidebarTheme) {
          // INDEPENDENT COLUMN PAGINATION
          let sidebarPageIndex = 0;
          let sidebarHeight = 0;
          let mainPageIndex = 0;
          let mainHeight = 0;

          const sectionNodes = Array.from(
            measureLayer.querySelectorAll('[data-section-id]')
          ) as HTMLElement[];

          sectionNodes.forEach((sectionNode) => {
            const sectionId = sectionNode.getAttribute('data-section-id')!;
            const sectionType = sectionNode.getAttribute('data-section-type')!;
            
            const isSidebarSection = ['PersonalInfo', 'Skills', 'Education'].includes(sectionType);
            let currentPIdx = isSidebarSection ? sidebarPageIndex : mainPageIndex;
            let currentH = isSidebarSection ? sidebarHeight : mainHeight;

            // Measure the section header (if visible and not PersonalInfo)
            const headerNode = sectionNode.querySelector('[data-type="header"]') as HTMLElement;
            if (headerNode && sectionType !== 'PersonalInfo') {
              const h = headerNode.getBoundingClientRect().height;
              
              // New page for this column if needed
              if (currentH + h > USABLE_HEIGHT_PX - 40) {
                currentPIdx++;
                currentH = 0;
                ensurePage(currentPIdx);
              }
              
              newPages[currentPIdx].elements.push({
                sectionId,
                sectionType,
                isHeader: true,
                node: <SectionRenderer.Header key={sectionId + '-header'} sectionId={sectionId} sectionType={sectionType} />,
              });
              currentH += h;
            }

            // Measure each item
            const itemNodes = Array.from(
              sectionNode.querySelectorAll('[data-item-id]')
            ) as HTMLElement[];

            itemNodes.forEach((itemNode) => {
              const itemId = itemNode.getAttribute('data-item-id')!;
              const itemHeight = itemNode.getBoundingClientRect().height;

              if (currentH + itemHeight > USABLE_HEIGHT_PX) {
                currentPIdx++;
                currentH = 0;
                ensurePage(currentPIdx);
              }

              newPages[currentPIdx].elements.push({
                sectionId,
                sectionType,
                itemId,
                node: <SectionRenderer.Item key={itemId} sectionId={sectionId} itemId={itemId} sectionType={sectionType} />,
              });
              currentH += itemHeight;
            });

            // Update column-specific state
            if (isSidebarSection) {
              sidebarPageIndex = currentPIdx;
              sidebarHeight = currentH;
            } else {
              mainPageIndex = currentPIdx;
              mainHeight = currentH;
            }
          });
        } else {
          // LEGACY SINGLE STREAM PAGINATION (Minimal theme)
          let currentPageIndex = 0;
          let currentHeight = 0;

          const sectionNodes = Array.from(
            measureLayer.querySelectorAll('[data-section-id]')
          ) as HTMLElement[];

          sectionNodes.forEach((sectionNode) => {
            const sectionId = sectionNode.getAttribute('data-section-id')!;
            const sectionType = sectionNode.getAttribute('data-section-type')!;

            const headerNode = sectionNode.querySelector('[data-type="header"]') as HTMLElement;
            if (headerNode) {
              const h = headerNode.getBoundingClientRect().height;
              if (currentHeight + h > USABLE_HEIGHT_PX - 50) {
                currentPageIndex++;
                ensurePage(currentPageIndex);
                currentHeight = 0;
              }
              newPages[currentPageIndex].elements.push({
                sectionId,
                sectionType,
                isHeader: true,
                node: <SectionRenderer.Header key={sectionId + '-header'} sectionId={sectionId} sectionType={sectionType} />,
              });
              currentHeight += h;
            }

            const itemNodes = Array.from(
              sectionNode.querySelectorAll('[data-item-id]')
            ) as HTMLElement[];

            itemNodes.forEach((itemNode) => {
              const itemId = itemNode.getAttribute('data-item-id')!;
              const itemHeight = itemNode.getBoundingClientRect().height;

              if (currentHeight + itemHeight > USABLE_HEIGHT_PX) {
                currentPageIndex++;
                ensurePage(currentPageIndex);
                currentHeight = 0;
              }

              newPages[currentPageIndex].elements.push({
                sectionId,
                sectionType,
                itemId,
                node: <SectionRenderer.Item key={itemId} sectionId={sectionId} itemId={itemId} sectionType={sectionType} />,
              });
              currentHeight += itemHeight;
            });
          });
        }

        setPages(newPages);
        setIsMeasuring(false);
        // Signal to Puppeteer that render is complete
        (window as any).RENDER_COMPLETE = true;
      }, 150);
    };

    setIsMeasuring(true);
    measureAndPaginate();

    return () => {
      isMounted = false;
    };
  }, [sections, styleConfig]);

  const offscreenWidth = (A4_WIDTH_MM - PADDING_MM * 2) + 'mm';

  return (
    <div className="layout-engine-container">
      {/* Off-screen measurement layer */}
      <div
        ref={offscreenRef}
        className="absolute opacity-0 pointer-events-none"
        style={{ left: '-9999px', width: offscreenWidth }}
      >
        <SectionRenderer.All />
      </div>

      {/* Paginated output */}
      <div className={isMeasuring ? 'opacity-50 blur-sm transition-all' : 'opacity-100 transition-all'}>
        {pages.map((page) => (
          <A4Page key={page.id} scale={scale} isPreview={isPreview}>
            {page.elements.map((el) => el.node)}
          </A4Page>
        ))}
      </div>
    </div>
  );
};

import { useCVStore } from '../../store/cvStore';
import type { SectionItem, Section } from '../../store/cvStore';

// Components to render Section Headers and Items for the A4 preview
export const SectionRenderer = {
  All: () => {
    const { sections, styleConfig } = useCVStore();
    const isSidebarTheme = styleConfig.theme === 'Modern Sidebar';

    if (isSidebarTheme) {
      // Split sections for sidebar layout
      const sidebarTypes = ['PersonalInfo', 'Skills', 'Education'];
      const sidebarSections = sections.filter(s => s.isVisible && sidebarTypes.includes(s.type));
      const mainSections = sections.filter(s => s.isVisible && !sidebarTypes.includes(s.type));

      return (
        <div className="w-full h-full flex flex-row gap-8" style={{ fontSize: `${styleConfig.fontSize}px`, lineHeight: styleConfig.lineSpacing }}>
          {/* Sidebar Area (Over the blue background) */}
          <div className="w-[45mm] flex flex-col gap-6 text-white pt-2">
            {sidebarSections.map((section) => (
              <div key={section.id} data-section-id={section.id} data-section-type={section.type} className="mb-2">
                {section.type === 'PersonalInfo' ? (
                  <div data-type="header" data-item-id={section.items[0]?.id}>
                    <ItemRenderer 
                      type={section.type} 
                      item={section.items[0]} 
                      primaryColor="#FFFFFF" 
                      secondaryColor="#e5e7eb" 
                      isSidebar={true}
                    />
                  </div>
                ) : (
                  <>
                    <SectionHeader section={section} isSidebar={true} primaryColor="#FFFFFF" secondaryColor="#e5e7eb" fontSize={styleConfig.fontSize} />
                    <div className="flex flex-col gap-3">
                      {section.items.map((item) => (
                        <div key={item.id} data-item-id={item.id}>
                          <ItemRenderer 
                            type={section.type} 
                            item={item} 
                            primaryColor="#FFFFFF" 
                            secondaryColor="#cbd5e1" 
                            isSidebar={true}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Main Content Area (Over the white background) */}
          <div className="flex-1 flex flex-col gap-6 pt-2">
            {mainSections.map((section) => (
              <div key={section.id} data-section-id={section.id} data-section-type={section.type} className="mb-2">
                {section.type === 'PersonalInfo' ? (
                  <div data-type="header" data-item-id={section.items[0]?.id}>
                    <ItemRenderer 
                      type={section.type} 
                      item={section.items[0]} 
                      primaryColor={styleConfig.primaryColor} 
                      secondaryColor={styleConfig.secondaryColor} 
                      isSidebar={false}
                    />
                  </div>
                ) : (
                  <>
                    <SectionHeader section={section} isSidebar={false} primaryColor={styleConfig.primaryColor} secondaryColor={styleConfig.secondaryColor} fontSize={styleConfig.fontSize} />
                    <div className="flex flex-col gap-3">
                      {section.items.map((item) => (
                        <div key={item.id} data-item-id={item.id}>
                          <ItemRenderer 
                            type={section.type} 
                            item={item} 
                            primaryColor={styleConfig.primaryColor} 
                            secondaryColor={styleConfig.secondaryColor} 
                            isSidebar={false}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default Minimal Layout
    return (
      <div
        className="w-full flex flex-col"
        style={{ 
          fontSize: `${styleConfig.fontSize}px`, 
          lineHeight: styleConfig.lineSpacing,
          color: '#1f2937'
        }}
      >
        {sections
          .filter((s) => s.isVisible)
          .map((section) => (
            <div key={section.id} data-section-id={section.id} data-section-type={section.type} className="mb-6">
              {section.type === 'PersonalInfo' ? (
                <div data-type="header" data-item-id={section.items[0]?.id}>
                   <ItemRenderer 
                    type={section.type} 
                    item={section.items[0]} 
                    primaryColor={styleConfig.primaryColor} 
                    secondaryColor={styleConfig.secondaryColor} 
                    isSidebar={false}
                  />
                </div>
              ) : (
                <>
                  <SectionHeader section={section} isSidebar={false} primaryColor={styleConfig.primaryColor} secondaryColor={styleConfig.secondaryColor} fontSize={styleConfig.fontSize} />
                  <div className="flex flex-col gap-3">
                    {section.items.map((item) => (
                      <div key={item.id} data-item-id={item.id}>
                        <ItemRenderer 
                          type={section.type} 
                          item={item} 
                          primaryColor={styleConfig.primaryColor} 
                          secondaryColor={styleConfig.secondaryColor} 
                          isSidebar={false}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
      </div>
    );
  },

  Header: ({ sectionId, isInSidebar }: { sectionId: string; sectionType?: string; isInSidebar?: boolean }) => {
    const section = useCVStore((state) => state.sections.find((s) => s.id === sectionId));
    const { styleConfig } = useCVStore();
    if (!section || section.type === 'PersonalInfo') return null;
    
    const isSidebarTheme = styleConfig.theme === 'Modern Sidebar';
    const isSidebar = isSidebarTheme && (isInSidebar || false);

    return (
      <SectionHeader 
        section={section} 
        isSidebar={isSidebar} 
        primaryColor={isSidebar ? '#FFFFFF' : styleConfig.primaryColor} 
        secondaryColor={isSidebar ? '#e2e8f0' : styleConfig.secondaryColor} 
        fontSize={styleConfig.fontSize} 
      />
    );
  },

  Item: ({ sectionId, itemId, isInSidebar }: { sectionId: string; itemId: string; sectionType?: string; isInSidebar?: boolean }) => {
    const section = useCVStore((state) => state.sections.find((s) => s.id === sectionId));
    const { styleConfig } = useCVStore();
    const item = section?.items.find((i) => i.id === itemId);
    if (!section || !item) return null;
    
    const isSidebarTheme = styleConfig.theme === 'Modern Sidebar';
    const isSidebar = isSidebarTheme && (isInSidebar || false);

    return (
      <div className="mb-3" style={{ breakInside: 'avoid', fontSize: `${styleConfig.fontSize}px`, lineHeight: styleConfig.lineSpacing }}>
        <ItemRenderer 
          type={section.type} 
          item={item} 
          primaryColor={isSidebar ? '#FFFFFF' : styleConfig.primaryColor} 
          secondaryColor={isSidebar ? '#cbd5e1' : styleConfig.secondaryColor} 
          isSidebar={isSidebar}
        />
      </div>
    );
  },
};

const SectionHeader = ({ section, isSidebar, primaryColor, secondaryColor, fontSize }: { section: Section, isSidebar: boolean, primaryColor: string, secondaryColor: string, fontSize: number }) => {
  if (section.type === 'PersonalInfo') return null;

  return (
    <div data-type="header" className={`flex items-center gap-3 ${isSidebar ? 'mb-1 mt-1' : 'mb-2 mt-0'}`}>
      <h2
        className="font-bold uppercase tracking-widest whitespace-nowrap"
        style={{
          color: primaryColor,
          fontSize: `${isSidebar ? fontSize - 2 : fontSize + 2}px`,
        }}
      >
        {section.title}
      </h2>
      <div 
        className="h-[1px] w-full" 
        style={{ backgroundColor: secondaryColor, opacity: 0.3 }}
      />
    </div>
  );
};

const ItemRenderer = ({
  type,
  item,
  primaryColor,
  secondaryColor,
  isSidebar,
}: {
  type: string;
  item: SectionItem;
  primaryColor: string;
  secondaryColor: string;
  isSidebar: boolean;
}) => {
  switch (type) {
    case 'PersonalInfo':
      return (
        <div className={`${isSidebar ? 'text-left px-1' : 'text-center'} ${isSidebar ? 'mb-4' : 'mb-6'}`}>
          <h1 className={`${isSidebar ? 'text-2xl' : 'text-4xl'} font-extrabold tracking-tight mb-1`} style={{ color: primaryColor }}>
            {item.fullName}
          </h1>
          {item.title && (
            <div className={`${isSidebar ? 'text-xs' : 'text-lg'} font-semibold uppercase tracking-widest mb-3`} style={{ color: secondaryColor }}>
              {item.title}
            </div>
          )}
          <div className={`flex ${isSidebar ? 'flex-col items-start gap-1.5' : 'justify-center gap-x-4 gap-y-1 flex-wrap'} ${isSidebar ? 'text-[11px]' : 'text-xs'} font-medium`} style={{ color: isSidebar ? '#e2e8f0' : '#4b5563' }}>
            {item.email && <span className="break-all">{item.email}</span>}
            {item.phone && <span>{item.phone}</span>}
            {item.showGithub && item.github && <span className="break-all">{item.github}</span>}
            {item.showLinkedin && item.linkedin && <span className="break-all">{item.linkedin}</span>}
          </div>
        </div>
      );
    case 'Objective':
    case 'Skills':
      return (
        <div
          className={`prose prose-sm max-w-none ${isSidebar ? 'text-slate-100 [&_strong]:text-white' : 'text-gray-800 [&_strong]:text-gray-900'} [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4`}
          style={{ fontSize: '0.9em' }}
          dangerouslySetInnerHTML={{ __html: item.text || '' }}
        />
      );
    case 'Experience':
      return (
        <div className="relative pl-4 border-l-2" style={{ borderColor: secondaryColor + '40' }}>
          <div className="flex justify-between items-start mb-0.5">
            <h3 className="font-bold text-base" style={{ color: primaryColor }}>
              {item.position}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap ml-4">
              {item.startDate} – {item.endDate}
            </span>
          </div>
          <div className="font-bold text-sm mb-2" style={{ color: secondaryColor }}>{item.company}</div>
          <div
            className="prose prose-sm max-w-none text-gray-700 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4"
            dangerouslySetInnerHTML={{ __html: item.description || '' }}
          />
        </div>
      );
    case 'Education':
      return (
        <div className={`relative ${isSidebar ? 'pl-0 border-l-0' : 'pl-4 border-l-2'}`} style={{ borderColor: secondaryColor + '40' }}>
          <div className="flex flex-col mb-1">
            <h3 className="font-bold text-sm" style={{ color: primaryColor }}>
              {item.degree}
            </h3>
            <div className="text-[10px] font-semibold opacity-80" style={{ color: secondaryColor }}>{item.year}</div>
          </div>
          <div className="font-bold text-[11px] mb-1" style={{ color: secondaryColor }}>{item.school}</div>
          {item.description && <div className={`text-[10px] italic ${isSidebar ? 'text-slate-200' : 'text-gray-600'}`}>{item.description}</div>}
        </div>
      );
    case 'Projects':
      return (
        <div className="relative pl-4 border-l-2" style={{ borderColor: secondaryColor + '40' }}>
          <div className="flex justify-between items-start mb-0.5">
            <h3 className="font-bold text-base" style={{ color: primaryColor }}>
              {item.name}
            </h3>
            {item.url && (
              <span className="text-[10px] font-medium underline whitespace-nowrap ml-4" style={{ color: primaryColor }}>{item.url}</span>
            )}
          </div>
          <div
            className="prose prose-sm max-w-none text-gray-700 mt-1 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4"
            dangerouslySetInnerHTML={{ __html: item.description || '' }}
          />
        </div>
      );
    default:
      return null;
  }
};

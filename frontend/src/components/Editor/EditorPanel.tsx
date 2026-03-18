import { useCVStore } from '../../store/cvStore';
import { RichTextEditor } from './RichTextEditor';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, Eye, EyeOff, Github, Linkedin, ChevronDown, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';

// Sortable section wrapper
function SortableSection({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <button
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-4 p-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 z-10"
      >
        <GripVertical size={16} />
      </button>
      {children}
    </div>
  );
}

export const EditorPanel = () => {
  const { sections, updateItem, updateSection, styleConfig, updateStyle, addItem, removeItem, reorderSections, toggleSectionCollapse } = useCVStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderSections(oldIndex, newIndex);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white border-r border-gray-200">
      {/* Header */}
      <div className="sticky top-0 bg-white z-20 border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">CV Builder</h2>
        <p className="text-xs text-gray-500 mt-0.5">Drag sections to reorder • Click to edit</p>
      </div>

      <div className="p-5">
        {/* Theme Settings */}
        <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-sm text-gray-700 mb-3 uppercase tracking-wider">Design Settings</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col text-xs font-medium text-gray-600 col-span-2">
              Theme
              <select
                value={styleConfig.theme}
                onChange={(e) => updateStyle({ theme: e.target.value as any })}
                className="mt-1 border border-gray-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="Minimal Professional">Minimal Professional</option>
                <option value="Modern Sidebar">Modern Sidebar</option>
              </select>
            </label>
            <label className="flex flex-col text-xs font-medium text-gray-600">
              Primary Color
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={styleConfig.primaryColor}
                  onChange={(e) => updateStyle({ primaryColor: e.target.value })}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-xs text-gray-400 font-mono">{styleConfig.primaryColor}</span>
              </div>
            </label>
            <label className="flex flex-col text-xs font-medium text-gray-600">
              Secondary Color
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={styleConfig.secondaryColor}
                  onChange={(e) => updateStyle({ secondaryColor: e.target.value })}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-xs text-gray-400 font-mono">{styleConfig.secondaryColor}</span>
              </div>
            </label>
            <label className="flex flex-col text-xs font-medium text-gray-600">
              Font Size
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="range"
                  min="10"
                  max="18"
                  value={styleConfig.fontSize}
                  onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500 w-6 text-right">{styleConfig.fontSize}</span>
              </div>
            </label>
            <label className="flex flex-col text-xs font-medium text-gray-600">
              Line Spacing
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.1"
                  value={styleConfig.lineSpacing}
                  onChange={(e) => updateStyle({ lineSpacing: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500 w-6 text-right">{styleConfig.lineSpacing}</span>
              </div>
            </label>
          </div>
        </div>

        {/* Sections with DnD */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-4">
              {sections.map((section, index) => (
                <SortableSection key={section.id} id={section.id}>
                  <div className={`border rounded-xl p-4 pl-6 shadow-sm transition-all ${section.isVisible ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-0">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSectionCollapse(section.id)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                          {section.isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <input
                          value={section.title}
                          onChange={(e) => updateSection(section.id, { title: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          className="font-bold text-sm text-gray-800 uppercase tracking-tight bg-transparent border-none focus:ring-1 focus:ring-blue-200 rounded px-1 -ml-1 w-full hover:bg-gray-100 transition-colors"
                        />
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); reorderSections(index, index - 1); }}
                          disabled={index === 0}
                          className={`p-1 rounded transition-colors ${index === 0 ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-400 hover:text-blue-600'}`}
                          title="Move Up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        
                        <button
                          onClick={(e) => { e.stopPropagation(); reorderSections(index, index + 1); }}
                          disabled={index === sections.length - 1}
                          className={`p-1 rounded transition-colors ${index === sections.length - 1 ? 'text-gray-200 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-400 hover:text-blue-600'}`}
                          title="Move Down"
                        >
                          <ArrowDown size={14} />
                        </button>

                        <div className="w-[1px] h-4 bg-gray-200 mx-1" />

                        <button
                          onClick={() => updateSection(section.id, { isVisible: !section.isVisible })}
                          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                          title={section.isVisible ? 'Hide' : 'Show'}
                        >
                          {section.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      </div>
                    </div>

                    {section.isVisible && !section.isCollapsed && (
                      <div className="flex flex-col gap-3 mt-4">
                        {section.items.map((item) => (
                          <div key={item.id} className="p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                            {/* PersonalInfo Editor */}
                            {section.type === 'PersonalInfo' && (
                              <div className="flex flex-col gap-2">
                                <input type="text" value={item.fullName || ''} onChange={(e) => updateItem(section.id, item.id, { fullName: e.target.value })} className="border border-gray-300 p-2 rounded-lg w-full text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Full Name" />
                                <input type="text" value={item.title || ''} onChange={(e) => updateItem(section.id, item.id, { title: e.target.value })} className="border border-gray-300 p-2 rounded-lg w-full text-sm font-semibold text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Job Title (e.g. Senior Software Engineer)" />
                                <input type="email" value={item.email || ''} onChange={(e) => updateItem(section.id, item.id, { email: e.target.value })} className="border border-gray-300 p-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email" />
                                <input type="tel" value={item.phone || ''} onChange={(e) => updateItem(section.id, item.id, { phone: e.target.value })} className="border border-gray-300 p-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Phone" />

                                {/* Toggleable GitHub */}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateItem(section.id, item.id, { showGithub: !item.showGithub })}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${item.showGithub ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'}`}
                                  >
                                    <Github size={12} /> GitHub
                                  </button>
                                  {item.showGithub && (
                                    <input type="text" value={item.github || ''} onChange={(e) => updateItem(section.id, item.id, { github: e.target.value })} className="border border-gray-300 p-1.5 rounded-lg flex-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none" placeholder="github.com/username" />
                                  )}
                                </div>

                                {/* Toggleable LinkedIn */}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateItem(section.id, item.id, { showLinkedin: !item.showLinkedin })}
                                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${item.showLinkedin ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'}`}
                                  >
                                    <Linkedin size={12} /> LinkedIn
                                  </button>
                                  {item.showLinkedin && (
                                    <input type="text" value={item.linkedin || ''} onChange={(e) => updateItem(section.id, item.id, { linkedin: e.target.value })} className="border border-gray-300 p-1.5 rounded-lg flex-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none" placeholder="linkedin.com/in/username" />
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Objective / Skills */}
                            {(section.type === 'Objective' || section.type === 'Skills') && (
                              <RichTextEditor content={item.text || ''} onChange={(html) => updateItem(section.id, item.id, { text: html })} />
                            )}

                            {/* Experience */}
                            {section.type === 'Experience' && (
                              <div className="flex flex-col gap-2">
                                <input type="text" value={item.position || ''} onChange={(e) => updateItem(section.id, item.id, { position: e.target.value })} className="border border-gray-300 p-2 rounded-lg w-full text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Job Title" />
                                <input type="text" value={item.company || ''} onChange={(e) => updateItem(section.id, item.id, { company: e.target.value })} className="border border-gray-300 p-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Company" />
                                <div className="flex gap-2">
                                  <input type="text" value={item.startDate || ''} onChange={(e) => updateItem(section.id, item.id, { startDate: e.target.value })} className="border border-gray-300 p-2 rounded-lg w-1/2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Start Date" />
                                  <input type="text" value={item.endDate || ''} onChange={(e) => updateItem(section.id, item.id, { endDate: e.target.value })} className="border border-gray-300 p-2 rounded-lg w-1/2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="End Date" />
                                </div>
                                <RichTextEditor content={item.description || ''} onChange={(html) => updateItem(section.id, item.id, { description: html })} />
                              </div>
                            )}

                            {/* Education */}
                            {section.type === 'Education' && (
                              <div className="flex flex-col gap-2">
                                <input type="text" value={item.degree || ''} onChange={(e) => updateItem(section.id, item.id, { degree: e.target.value })} className="border border-gray-300 p-2 rounded-lg w-full text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Degree" />
                                <input type="text" value={item.school || ''} onChange={(e) => updateItem(section.id, item.id, { school: e.target.value })} className="border border-gray-300 p-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="School / University" />
                                <input type="text" value={item.year || ''} onChange={(e) => updateItem(section.id, item.id, { year: e.target.value })} className="border border-gray-300 p-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Year" />
                              </div>
                            )}

                            {/* Projects */}
                            {section.type === 'Projects' && (
                              <div className="flex flex-col gap-2">
                                <input type="text" value={item.name || ''} onChange={(e) => updateItem(section.id, item.id, { name: e.target.value })} className="border border-gray-300 p-2 rounded-lg w-full text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Project Name" />
                                <input type="text" value={item.url || ''} onChange={(e) => updateItem(section.id, item.id, { url: e.target.value })} className="border border-gray-300 p-2 rounded-lg w-full text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Project URL (optional)" />
                                <RichTextEditor content={item.description || ''} onChange={(html) => updateItem(section.id, item.id, { description: html })} />
                              </div>
                            )}

                            {/* Remove button */}
                            <button
                              onClick={() => removeItem(section.id, item.id)}
                              className="mt-2 flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                        ))}

                        {/* Add item button for multi-item sections */}
                        {section.type !== 'PersonalInfo' && section.type !== 'Objective' && (
                          <button
                            onClick={() => {
                              const newItem = { id: `item-${Date.now()}` };
                              addItem(section.id, newItem);
                            }}
                            className="flex items-center gap-1 mt-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Plus size={14} /> Add Item
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </SortableSection>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

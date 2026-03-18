import { create } from 'zustand';

export type ThemeType = 'Minimal Professional' | 'Modern Sidebar';
export type SectionType = 'PersonalInfo' | 'Objective' | 'Education' | 'Experience' | 'Projects' | 'Skills';

export interface StyleConfig {
  primaryColor: string;
  secondaryColor: string;
  fontSize: number;
  lineSpacing: number;
  theme: ThemeType;
}

export interface SectionItem {
  id: string;
  [key: string]: any;
}

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  items: SectionItem[];
  isVisible: boolean;
  isCollapsed?: boolean;
}

export interface CVState {
  sections: Section[];
  styleConfig: StyleConfig;
  updateItem: (sectionId: string, itemId: string, updates: Partial<SectionItem>) => void;
  addItem: (sectionId: string, item: SectionItem) => void;
  removeItem: (sectionId: string, itemId: string) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  reorderSections: (oldIndex: number, newIndex: number) => void;
  toggleSectionCollapse: (sectionId: string) => void;
  updateStyle: (updates: Partial<StyleConfig>) => void;
  reorderItems: (sectionId: string, startIndex: number, endIndex: number) => void;
}

const initialSections: Section[] = [
  {
    id: 'personal-info-1',
    type: 'PersonalInfo',
    title: 'Personal Information',
    items: [{
      id: 'pi-1',
      fullName: 'Abdallah Beshary',
      title: 'Senior Software Engineer',
      email: 'a.beshary@example.com',
      phone: '+20 123 456 7890',
      github: 'github.com/beshary',
      linkedin: 'linkedin.com/in/beshary',
      showGithub: true,
      showLinkedin: true,
    }],
    isVisible: true,
  },
  {
    id: 'objective-1',
    type: 'Objective',
    title: 'Professional Summary',
    items: [{
      id: 'obj-1',
      text: '<p>Innovative Senior Software Engineer with over 6 years of experience in building scalable web applications. Expert in React, Node.js, and cloud architecture. Proven track record of leading teams and delivering high-quality software solutions.</p>'
    }],
    isVisible: true,
  },
  {
    id: 'experience-1',
    type: 'Experience',
    title: 'Work Experience',
    items: [
      {
        id: 'exp-1',
        position: 'Senior Full-stack Developer',
        company: 'Tech Innovators Inc.',
        startDate: 'Jan 2021',
        endDate: 'Present',
        description: '<ul><li>Led the migration of a legacy monolithic application to a microservices architecture.</li><li>Mentored junior developers and performed code reviews.</li><li>Optimized database queries, reducing response times by 40%.</li></ul>'
      },
      {
        id: 'exp-2',
        position: 'Web Developer',
        company: 'Creative Solutions',
        startDate: 'Jun 2018',
        endDate: 'Dec 2020',
        description: '<ul><li>Developed and maintained responsive frontend components using React.</li><li>Integrated RESTful APIs and optimized web performance.</li></ul>'
      }
    ],
    isVisible: true,
  },
  {
    id: 'projects-1',
    type: 'Projects',
    title: 'Key Projects',
    items: [
      {
        id: 'proj-1',
        name: 'AI-Powered CV Builder',
        url: 'github.com/beshary/cv-builder',
        description: '<p>A multi-theme CV builder with real-time A4 preview and PDF export functionality built with React and Puppeteer.</p>'
      }
    ],
    isVisible: true,
  },
  {
    id: 'education-1',
    type: 'Education',
    title: 'Education',
    items: [
      {
        id: 'edu-1',
        degree: 'Bachelor of Science in Computer Engineering',
        school: 'Cairo University',
        year: '2018',
        description: 'Focused on software engineering, algorithms, and data structures.'
      }
    ],
    isVisible: true,
  },
  {
    id: 'skills-1',
    type: 'Skills',
    title: 'Technical Skills',
    items: [{
      id: 'skills-item-1',
      text: '<p><strong>Languages:</strong> JavaScript (ES6+), TypeScript, HTML5, CSS3</p><p><strong>Frameworks:</strong> React, Next.js, Node.js, Express, TailwindCSS</p><p><strong>Tools & Platforms:</strong> AWS, Docker, PostgreSQL, MongoDB, Git</p>'
    }],
    isVisible: true,
  }
];

export const useCVStore = create<CVState>((set) => ({
  styleConfig: {
    primaryColor: '#1e3a8a', // Professional Navy Blue
    secondaryColor: '#475569', // Professional Slate Gray
    fontSize: 14,
    lineSpacing: 1.5,
    theme: 'Modern Sidebar',
  },
  sections: initialSections,
  toggleSectionCollapse: (sectionId: string) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId ? { ...s, isCollapsed: !s.isCollapsed } : s
      ),
    })),
  updateStyle: (config) => set((state) => ({
    styleConfig: { ...state.styleConfig, ...config }
  })),

  updateSection: (id, updates) => set((state) => ({
    sections: state.sections.map((s) => s.id === id ? { ...s, ...updates } : s)
  })),

  reorderSections: (startIndex, endIndex) => set((state) => {
    const newSections = [...state.sections];
    const [removed] = newSections.splice(startIndex, 1);
    newSections.splice(endIndex, 0, removed);
    return { sections: newSections };
  }),

  addItem: (sectionId, item) => set((state) => ({
    sections: state.sections.map((s) => s.id === sectionId ? { ...s, items: [...s.items, item] } : s)
  })),

  updateItem: (sectionId, itemId, updates) => set((state) => ({
    sections: state.sections.map((s) => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        items: s.items.map((item) => item.id === itemId ? { ...item, ...updates } : item)
      };
    })
  })),

  removeItem: (sectionId, itemId) => set((state) => ({
    sections: state.sections.map((s) => {
      if (s.id !== sectionId) return s;
      return { ...s, items: s.items.filter((item) => item.id !== itemId) };
    })
  })),
  
  reorderItems: (sectionId, startIndex, endIndex) => set((state) => {
    return {
      sections: state.sections.map((s) => {
        if (s.id !== sectionId) return s;
        const newItems = [...s.items];
        const [removed] = newItems.splice(startIndex, 1);
        newItems.splice(endIndex, 0, removed);
        return { ...s, items: newItems };
      })
    };
  })
}));

export type Kind = 'core' | 'project' | 'skill';

export interface GraphNode {
  id: string;
  kind: Kind;
  label: string;
  sub: string;
  desc: string;
  items: string[];
  repo?: string;
  color: string;
  pos: [number, number, number];
  links: string[];
}

const C = {
  lime: '#b6ff3c',
  cyan: '#5ee1ff',
  pink: '#ff7ad9',
  amber: '#ffb347',
  violet: '#9a86ff',
};

export const nodes: GraphNode[] = [
  {
    id: 'heer', kind: 'core', label: 'Heer', sub: 'Software developer',
    desc: 'M.Sc. Information Technology student at Dhirubhai Ambani University, after a B.Sc. IT at Shreyarth University (CPI 8.88). This summer I researched LLM, RAG, vector database and agent workflow approaches at Tata Motors’ Digital.ai Labs.',
    items: ['Gandhinagar, India', 'Open to freelance projects', 'Open to software roles', 'mehta.heer910@gmail.com'],
    color: C.lime, pos: [0, 0, 0], links: ['book', 'insight', 'segment', 'fire'],
  },
  {
    id: 'book', kind: 'project', label: 'Book-E-Pedia', sub: 'Full-stack · React, Django',
    desc: 'A full-stack bookstore built with React and Django: catalog browsing, product details, a cart and role-based admin management.',
    items: ['React', 'Django', 'REST APIs', 'SQLite'], repo: 'https://github.com/heer00/book-e-pedia',
    color: C.cyan, pos: [5.2, 1.2, 1.4], links: ['frontend', 'backend', 'data'],
  },
  {
    id: 'insight', kind: 'project', label: 'InsightEdge', sub: 'AI · Hackathon · FastAPI',
    desc: 'A team-built career guidance platform for smart cities. I wrote the resume parsing, skill extraction and the FastAPI endpoints.',
    items: ['Python', 'FastAPI', 'NLP', 'Firebase'], repo: 'https://github.com/heer00/InsightEdge',
    color: C.pink, pos: [-3.6, 2.2, 4.2], links: ['languages', 'backend', 'data'],
  },
  {
    id: 'segment', kind: 'project', label: 'Customer Segmentation', sub: 'Machine learning · K-Means',
    desc: 'K-Means clustering of customer purchase behaviour with feature scaling and the elbow method, presented in an interactive Streamlit app.',
    items: ['Python', 'Scikit-learn', 'Pandas', 'Streamlit'], repo: 'https://github.com/heer00/customer-segment-analysis',
    color: C.amber, pos: [-4.4, -1.8, -3.6], links: ['languages', 'data'],
  },
  {
    id: 'fire', kind: 'project', label: 'Forest Fire Detection', sub: 'Computer vision · CNN',
    desc: 'Notebook-based wildfire detection using image preprocessing and CNN modelling with TensorFlow and Keras, plus supporting data exploration.',
    items: ['Python', 'TensorFlow', 'Keras', 'Jupyter'], repo: 'https://github.com/heer00/Forest-Fire-Detection',
    color: C.violet, pos: [3.8, -2.4, -4.4], links: ['languages', 'data', 'tools'],
  },
  {
    id: 'languages', kind: 'skill', label: 'Languages', sub: 'Skill cluster',
    desc: 'What I write code in.', items: ['Python', 'JavaScript', 'TypeScript', 'C++', 'SQL'],
    color: C.lime, pos: [10.5, 4.5, -3], links: [],
  },
  {
    id: 'backend', kind: 'skill', label: 'Backend', sub: 'Skill cluster',
    desc: 'Services and APIs.', items: ['Django', 'FastAPI', 'REST APIs'],
    color: C.cyan, pos: [-9.5, 4.8, 4.6], links: [],
  },
  {
    id: 'frontend', kind: 'skill', label: 'Frontend', sub: 'Skill cluster',
    desc: 'Interfaces on top of the services.', items: ['React', 'HTML', 'CSS', 'Bootstrap'],
    color: C.pink, pos: [8.8, -4.8, 7], links: [],
  },
  {
    id: 'data', kind: 'skill', label: 'Data and AI', sub: 'Skill cluster',
    desc: 'Models, data and the clever part.', items: ['PostgreSQL', 'Firebase', 'Pandas', 'Scikit-learn', 'LLMs', 'RAG'],
    color: C.amber, pos: [-8.6, -5.4, -7.4], links: [],
  },
  {
    id: 'tools', kind: 'skill', label: 'Tools', sub: 'Skill cluster',
    desc: 'How the work gets done.', items: ['Git', 'Linux', 'Postman', 'VS Code', 'DSA', 'OOP', 'DBMS', 'Networks'],
    color: C.violet, pos: [2.6, 6.8, -10.4], links: [],
  },
];

export const byId = new Map(nodes.map((n) => [n.id, n]));

// give the four projects more room around the core
nodes.forEach((n) => { if (n.kind === 'project') n.pos = n.pos.map((x) => x * 1.35) as [number, number, number]; });

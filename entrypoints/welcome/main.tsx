import ReactDOM from 'react-dom/client';

import '@/assets/tailwind.css';
import { WelcomePage } from '@/src/ui/welcome/WelcomePage';

if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(<WelcomePage />);

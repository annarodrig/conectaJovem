import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';

// ==========================================
// CONFIGURAÇÕES GLOBAIS E FIREBASE
// ==========================================
const appId = typeof __app_id !== 'undefined' ? __app_id : 'conecta-jovem-ia';
let db = null;
let auth = null;

try {
  if (typeof __firebase_config !== 'undefined') {
    const firebaseConfig = JSON.parse(__firebase_config);
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (e) {
  console.error("Firebase initialization skipped or failed:", e);
}


// ==========================================
// ÍCONES CUSTOMIZADOS (SVG inline para maior performance e compatibilidade)
// ==========================================
const Icons = {
  Cpu: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
  Book: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Presenter: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21h8M12 17V21m0-18C7.029 3 3 7.029 3 12c0 2.21.803 4.233 2.136 5.804l-.883.883a1 1 0 001.414 1.414l.883-.883A9.956 9.956 0 0012 21c4.971 0 9-4.029 9-9s-4.029-9-9-9z" /></svg>,
  Sparkles: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  ChevronLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>,
  ChevronRight: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>,
  Lightbulb: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  Brain: () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
  Trend: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  Send: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Eye: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Warning: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Star: () => <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
  Trophy: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0h4m-4 0H8m12 3a2 2 0 100-4h-2V7a2 2 0 00-2-2H8a2 2 0 00-2 2v2H4a2 2 0 100 4h2v1a6 6 0 0012 0v-1h2z" /></svg>,
  Lock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function App() {
  const [viewMode, setViewMode] = useState('presenter'); // 'presenter' (slides) ou 'book' (apostila)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [user, setUser] = useState(null);
  
  // Estados para Atividades Interativas
  const [activeTimelineYear, setActiveTimelineYear] = useState(1950);
  const [activeHierarchy, setActiveHierarchy] = useState('ia');
  const [learningSimulationType, setLearningSimulationType] = useState('supervisionado');
  const [simulatingStep, setSimulatingStep] = useState(0);
  const [simulationResult, setSimulationResult] = useState('');
  const [quizScore, setQuizScore] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  // Estado para o Prompt Lab (Integração com API Gemini 2.5)
  const [promptInput, setPromptInput] = useState('');
  const [geminiResponse, setGeminiResponse] = useState('');
  const [isLoadingPrompt, setIsLoadingPrompt] = useState(false);
  const [promptLabError, setPromptLabError] = useState('');

  // Autenticação Firebase Anônima de Segurança
  useEffect(() => {
    if (auth) {
      const initAuth = async () => {
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        } catch (error) {
          console.error("Auth initialization failed:", error);
        }
      };
      initAuth();
      const unsubscribe = onAuthStateChanged(auth, setUser);
      return () => unsubscribe();
    }
  }, []);

  // Atalhos de teclado para os slides
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewMode === 'presenter') {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          nextSlide();
        } else if (e.key === 'ArrowLeft') {
          prevSlide();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, currentSlide]);

  // ==========================================
  // MODELO DE DADOS DOS SLIDES / CAPÍTULOS
  // ==========================================
  const slideContent = [
    {
      title: "Como a Inteligência Artificial vai potencializar seu início de carreira",
      subtitle: "Projeto Conecta Jovem | WSNET",
      duration: "3 min",
      content: (
        <div className="flex flex-col items-center justify-center text-center h-full space-y-6">
          <div className="p-4 bg-teal-500/10 rounded-full animate-bounce">
            <Icons.Cpu />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight max-w-4xl">
            Como a Inteligência Artificial vai <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">potencializar seu início de carreira</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl font-light">
            Desenvolvendo as habilidades digitais mais cobiçadas pelo mercado de trabalho com ética e pensamento crítico.
          </p>
          <div className="pt-8 border-t border-slate-800/80 w-full max-w-md">
            <p className="text-sm font-semibold tracking-widest text-teal-400 uppercase">Apresentado por Anna Beatriz</p>
            <p className="text-xs text-slate-500 mt-1">Conecta Jovem — WSNET 2026</p>
          </div>
        </div>
      )
    },
    {
      title: "IA no Cotidiano: Você já usa e talvez não saiba!",
      subtitle: "A IA não é ficção, é a sua rotina",
      duration: "4 min",
      content: (
        <div className="space-y-6">
          <p className="text-center text-slate-400 mb-2">Toque em qualquer card para descobrir como a Inteligência Artificial trabalha nos bastidores:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { title: "Filmes e Séries", app: "Netflix", desc: "Algoritmos analisam o segundo exato que você para de assistir a um filme para recomendar o próximo sucesso.", icon: "🎬" },
              { title: "Sua Playlist", app: "Spotify", desc: "Cria playlists personalizadas comparando seu gosto musical com o de milhões de usuários parecidos.", icon: "🎵" },
              { title: "Melhor Rota", app: "Waze", desc: "Processa dados de trânsito em tempo real de milhares de motoristas para prever gargalos e achar atalhos.", icon: "🚗" },
              { title: "Caixa de Entrada", app: "Gmail/Outlook", desc: "Lê padrões textuais para reter 99% dos e-mails maliciosos ou de vendas indesejadas antes de você abrir.", icon: "✉️" },
              { title: "Segurança no Pix", app: "Bancos", desc: "Analisa o perfil e a velocidade de digitação para bloquear transações atípicas e prevenir golpes em milissegundos.", icon: "🔒" },
              { title: "Redes Sociais", app: "Instagram/TikTok", desc: "Mede o tempo que seus olhos permanecem em um vídeo para sugerir conteúdos visualmente e textualmente parecidos.", icon: "📱" },
            ].map((item, idx) => (
              <div key={idx} className="group relative bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 p-5 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer">
                <span className="text-3xl block mb-2">{item.icon}</span>
                <h4 className="font-bold text-slate-200">{item.title}</h4>
                <p className="text-xs text-teal-400 font-semibold mb-2">{item.app}</p>
                <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Uma breve história de 70 anos",
      subtitle: "Dos laboratórios às nossas mãos",
      duration: "4 min",
      content: (
        <div className="space-y-8">
          <div className="flex justify-center space-x-2 md:space-x-4">
            {[1950, 1956, 1970, 1997, 2026].map((year) => (
              <button
                key={year}
                onClick={() => setActiveTimelineYear(year)}
                className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
                  activeTimelineYear === year 
                    ? 'bg-teal-500 text-slate-900 shadow-md scale-105' 
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {year === 2026 ? "Hoje" : year}
              </button>
            ))}
          </div>
          
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 min-h-[160px] flex flex-col justify-center">
            {activeTimelineYear === 1950 && (
              <div className="space-y-2 animate-fadeIn">
                <h3 className="text-xl font-bold text-teal-400">1950 — O Teste de Turing</h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  O genial matemático britânico <strong>Alan Turing</strong> publica um artigo propondo a famosa pergunta: <em>"As máquinas podem pensar?"</em>. Ele cria um experimento para testar se uma máquina conseguiria imitar as respostas de um humano de forma indistinguível.
                </p>
              </div>
            )}
            {activeTimelineYear === 1956 && (
              <div className="space-y-2 animate-fadeIn">
                <h3 className="text-xl font-bold text-teal-400">1956 — O Nascimento do Termo</h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Na célebre Conferência de Dartmouth, cientistas de computação se unem e o pesquisador americano <strong>John McCarthy</strong> cunha oficialmente, pela primeira vez na história, o termo <strong>"Inteligência Artificial"</strong>.
                </p>
              </div>
            )}
            {activeTimelineYear === 1970 && (
              <div className="space-y-2 animate-fadeIn">
                <h3 className="text-xl font-bold text-teal-400">1960 a 1970 — Primeiras conversas</h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Nasce o <strong>ELIZA</strong>, um dos primeiros programas capazes de simular diálogos terapêuticos (o avô dos chatbots antigos), e o <strong>Shakey</strong>, um robô que já conseguia analisar o ambiente físico e desviar de obstáculos simples.
                </p>
              </div>
            )}
            {activeTimelineYear === 1997 && (
              <div className="space-y-2 animate-fadeIn">
                <h3 className="text-xl font-bold text-teal-400">1997 — IA Derrota o Campeão de Xadrez</h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  O supercomputador <strong>Deep Blue</strong> da IBM derrota o maior campeão mundial de xadrez da época, Garry Kasparov. Esse marco prova o poder do processamento bruto e do cálculo matemático aplicado a jogos de estratégia.
                </p>
              </div>
            )}
            {activeTimelineYear === 2026 && (
              <div className="space-y-2 animate-fadeIn">
                <h3 className="text-xl font-bold text-teal-400">2010 até Hoje — A Era Generativa</h3>
                <p className="text-slate-300 leading-relaxed text-sm">
                  Graças ao aumento fantástico do poder de computadores e placas gráficas, as redes neurais profundas explodem de capacidade. Ferramentas como o <strong>ChatGPT, Gemini e Copilot</strong> passam a fazer parte das vidas e do trabalho cotidiano de milhões de pessoas.
                </p>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      title: "O 'Cebolão' da IA: Entenda as Camadas",
      subtitle: "IA não é um bloco único. São famílias de tecnologias.",
      duration: "5 min",
      content: (
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col space-y-3">
            {[
              { id: 'ia', title: "Inteligência Artificial (Geral)", desc: "A ciência de criar máquinas com capacidades intelectuais similares às humanas (resolver problemas, deduzir, lógica).", color: "border-slate-500 text-slate-300 bg-slate-900/40" },
              { id: 'ml', title: "Machine Learning (Aprendizado de Máquina)", desc: "Subcampo onde sistemas aprendem sozinhos analisando milhões de exemplos e dados, em vez de seguir regras manuais pré-programadas.", color: "border-teal-500/50 text-teal-300 bg-teal-950/10" },
              { id: 'dl', title: "Deep Learning (Redes Neurais Profundas)", desc: "Uma evolução do ML focada em redes neurais multicamadas, ideal para decifrar dados super complexos (voz, imagens de satélite, diagnóstico médico).", color: "border-cyan-500/50 text-cyan-300 bg-cyan-950/10" },
              { id: 'gen', title: "IA Generativa (Criadores de Conteúdo)", desc: "Modelos modernos treinados para sintetizar novos conteúdos originais (textos, códigos, apresentações, vídeos).", color: "border-pink-500/50 text-pink-300 bg-pink-950/10" }
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveHierarchy(layer.id)}
                className={`p-4 border text-left rounded-xl transition-all ${layer.color} ${
                  activeHierarchy === layer.id ? 'ring-2 ring-teal-400 scale-[1.02] font-semibold' : 'opacity-80 hover:opacity-100'
                }`}
              >
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${layer.id === 'ia' ? 'bg-slate-400' : layer.id === 'ml' ? 'bg-teal-400' : layer.id === 'dl' ? 'bg-cyan-400' : 'bg-pink-400'}`} />
                  {layer.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{layer.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 shadow-inner">
              {/* Círculo IA */}
              <div className={`absolute w-[90%] h-[90%] rounded-full border-2 border-dashed border-slate-700/60 transition-all flex items-start justify-center pt-3 ${activeHierarchy === 'ia' ? 'bg-slate-800/20 border-solid scale-105' : ''}`}>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">Inteligência Artificial</span>
              </div>
              {/* Círculo ML */}
              <div className={`absolute w-[70%] h-[70%] rounded-full border border-teal-500/40 transition-all flex items-start justify-center pt-3 ${activeHierarchy === 'ml' ? 'bg-teal-500/10 border-teal-400 scale-105' : ''}`}>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-teal-400">Machine Learning</span>
              </div>
              {/* Círculo DL */}
              <div className={`absolute w-[50%] h-[50%] rounded-full border border-cyan-500/30 transition-all flex items-start justify-center pt-3 ${activeHierarchy === 'dl' ? 'bg-cyan-500/10 border-cyan-400 scale-105' : ''}`}>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-cyan-400">Deep Learning</span>
              </div>
              {/* Círculo GenAI */}
              <div className={`absolute w-[30%] h-[30%] rounded-full border border-pink-500/30 bg-pink-500/5 transition-all flex items-center justify-center p-2 text-center ${activeHierarchy === 'gen' ? 'bg-pink-500/20 border-pink-400 scale-105' : ''}`}>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-pink-400 leading-none">IA Generativa</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Como uma IA Aprende? (Simulador Prático)",
      subtitle: "Existem 3 caminhos principais para treinar o cérebro eletrônico",
      duration: "5 min",
      content: (
        <div className="space-y-6">
          <div className="flex justify-center border-b border-slate-800/80 pb-2 gap-4">
            {[
              { id: 'supervisionado', label: "Supervisionado" },
              { id: 'nao-supervisionado', label: "Não Supervisionado" },
              { id: 'reforco', label: "Por Reforço" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setLearningSimulationType(tab.id);
                  setSimulatingStep(0);
                  setSimulationResult('');
                }}
                className={`pb-2 px-4 text-sm font-semibold transition-all border-b-2 ${
                  learningSimulationType === tab.id 
                    ? 'border-teal-500 text-teal-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 min-h-[220px] flex flex-col justify-between">
              {learningSimulationType === 'supervisionado' && (
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-teal-400">Exemplo clássico: Classificador de Animais</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Nós damos à máquina milhares de imagens etiquetadas: "Zebra (com listras)" e "Cavalo (sem listras)". O algoritmo de IA descobre o padrão visual diferenciador.
                  </p>
                  <div className="flex gap-3 justify-center pt-2">
                    <span className="p-2 border border-slate-700 rounded-lg text-xs flex items-center bg-slate-800">🦓 Imagem 1: "Zebra"</span>
                    <span className="p-2 border border-slate-700 rounded-lg text-xs flex items-center bg-slate-800">🐎 Imagem 2: "Cavalo"</span>
                  </div>
                </div>
              )}
              {learningSimulationType === 'nao-supervisionado' && (
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-teal-400">Exemplo clássico: Agrupamento de Clientes (Clustering)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Você joga dados brutos sem rótulos. A IA analisa similaridades de gastos dos clientes e descobre sozinha grupos como "compradores de impulso" ou "economizadores de fins de semana".
                  </p>
                  <div className="flex gap-2 justify-center pt-2">
                    <span className="px-3 py-1.5 border border-dashed border-teal-500/50 rounded-full text-xs text-teal-300">Grupo A: Alta Frequência</span>
                    <span className="px-3 py-1.5 border border-dashed border-cyan-500/50 rounded-full text-xs text-cyan-300">Grupo B: Caçadores de Cupom</span>
                  </div>
                </div>
              )}
              {learningSimulationType === 'reforco' && (
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-teal-400">Exemplo clássico: Navegação de Robô ou Game Loop</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Um agente virtual se move no tabuleiro. Acertou a rota? Ganha <span className="text-teal-400 font-bold">+10 pontos (Recompensa)</span>. Bateu na parede? Perde <span className="text-red-400 font-bold">-5 pontos (Penalidade)</span>. Ele repete o ciclo até aprender a rota perfeita.
                  </p>
                  <div className="flex gap-3 justify-center pt-2">
                    <span className="px-2 py-1 bg-teal-950 border border-teal-800 rounded text-xs text-teal-300">Ação ➡️ Estado</span>
                    <span className="px-2 py-1 bg-red-950 border border-red-800 rounded text-xs text-red-300">Penalidade ou Recompensa 🔄</span>
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (simulatingStep < 3) {
                      setSimulatingStep(prev => prev + 1);
                    } else {
                      setSimulationResult('Treinamento Finalizado com Sucesso! 🧠✨');
                    }
                  }}
                  className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 text-slate-900 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Icons.Presenter />
                  {simulatingStep === 0 ? "Começar Treino" : simulatingStep < 3 ? "Processar Nova Época" : "Ver Resultado"}
                </button>
                <span className="text-xs text-slate-500 font-mono">Status: Etapa {simulatingStep}/3</span>
              </div>
            </div>

            <div className="md:col-span-5 bg-slate-900/40 p-5 border border-slate-800 rounded-2xl flex flex-col justify-center text-center h-full min-h-[220px]">
              <span className="text-xs uppercase tracking-wider text-slate-500 block mb-2">Simulação do Modelo</span>
              {simulatingStep === 0 && (
                <p className="text-slate-500 text-sm italic">Clique em "Começar Treino" para carregar os dados no pipeline de aprendizado da IA.</p>
              )}
              {simulatingStep === 1 && (
                <div className="space-y-2 animate-pulse text-teal-300 text-sm">
                  <p>⏳ Lendo pacotes de dados...</p>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full w-[33%]"></div>
                  </div>
                  <p className="text-[10px] text-slate-500">Redes neurais ajustando pesos e filtros sinápticos.</p>
                </div>
              )}
              {simulatingStep === 2 && (
                <div className="space-y-2 animate-pulse text-cyan-300 text-sm">
                  <p>🔄 Rodando inferências de teste...</p>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full w-[66%]"></div>
                  </div>
                  <p className="text-[10px] text-slate-500">Erro residual caindo a cada ciclo.</p>
                </div>
              )}
              {simulatingStep === 3 && (
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-teal-500/10 text-teal-400 rounded-full flex items-center justify-center mx-auto text-xl">✔️</div>
                  <p className="text-teal-400 text-sm font-bold">{simulationResult || "Pronto para avaliação!"}</p>
                  <p className="text-xs text-slate-400 leading-normal">
                    {learningSimulationType === 'supervisionado' && "A IA agora reconhece e rotula zebras com 98.7% de acurácia."}
                    {learningSimulationType === 'nao-supervisionado' && "Agrupamentos concluídos. 3 clusters identificados perfeitamente."}
                    {learningSimulationType === 'reforco' && "O agente achou a rota mais rápida e livre de perigos pelo mapa."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Como funciona a IA Generativa?",
      subtitle: "Não é copiar e colar! É pura probabilidade matemática.",
      duration: "5 min",
      content: (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800/20 border border-slate-700/50 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-teal-400 flex items-center gap-2 text-base mb-3">
                📖 Como gera Textos?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Durante o pré-treinamento, o modelo leu trilhões de frases em fóruns, livros e artigos científicos. Ele aprendeu a estrutura sintática de forma tão profunda que consegue prever, com precisão espantosa, qual caractere e palavra deve seguir a sequência gerada.
              </p>
            </div>
            <div className="mt-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
              <span className="text-teal-400">"O céu está..."</span> ➡️ <span className="text-yellow-400 font-semibold">azul (92% de probabilidade)</span>, escuro (7%), caindo (1%).
            </div>
          </div>

          <div className="bg-slate-800/20 border border-slate-700/50 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-cyan-400 flex items-center gap-2 text-base mb-3">
                🎨 Como gera Imagens?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Utiliza redes de difusão de dados. O modelo aprendeu a associar textos de descrição (legendas) com componentes visuais básicos. Diante de um pedido, ele começa gerando uma tela de ruído puro (chuvisco de TV velha) e vai lapidando e ordenando pixels até formar o visual descrito.
              </p>
            </div>
            <div className="mt-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono">
              <span className="text-cyan-400">"Gato astronauta"</span> ➡️ Converte ruído aleatório em capacete de vidro e orelhas de gato.
            </div>
          </div>
        </div>
      )
    },
    {
      title: "O Poder dos Prompts (Engenharia de Prompt)",
      subtitle: "Seu sucesso com a tecnologia depende das suas perguntas",
      duration: "5 min",
      content: (
        <div className="space-y-6">
          <p className="text-center text-xs text-slate-400">Veja o contraste gritante entre um prompt descuidado e um profissional estruturado:</p>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Lado Ruim */}
            <div className="bg-red-950/20 border border-red-900/40 p-5 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold text-red-400 px-2 py-1 bg-red-950 border border-red-900/60 rounded-full uppercase tracking-wider">✖ Prompt Ruim</span>
                <p className="text-sm font-semibold text-slate-200 mt-3 italic">"Me fala sobre a Segunda Guerra Mundial."</p>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
                <p className="text-red-400/90 font-bold mb-1">Resultado da IA:</p>
                Gera um texto de 15 parágrafos extremamente formal, repleto de datas excessivas, sem foco e cansativo de ler, inadequado para preparar um resumo rápido para a escola.
              </div>
            </div>

            {/* Lado Bom */}
            <div className="bg-teal-950/20 border border-teal-900/40 p-5 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-bold text-teal-400 px-2 py-1 bg-teal-950 border border-teal-900/60 rounded-full uppercase tracking-wider">✔️ Prompt Excelente</span>
                <p className="text-sm font-semibold text-slate-200 mt-3 italic">
                  "Explique as <span className="text-teal-400">3 principais causas</span> da Segunda Guerra Mundial em <span className="text-teal-400">linguagem simples</span> para alguém do <span className="text-teal-400">9º ano</span>, e sugira <span className="text-teal-400">2 fontes</span> confiáveis."
                </p>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
                <p className="text-teal-400 font-bold mb-1">Resultado da IA:</p>
                Entrega um resumo cirúrgico estruturado em tópicos legíveis, com analogias adequadas para a idade e links/recomendações de livros perfeitamente aplicáveis para estudos.
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Como a IA acelera o início da sua Carreira",
      subtitle: "A IA não veio substituir seu cérebro, ela é seu acelerador",
      duration: "4 min",
      content: (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 pt-2 font-semibold">Atividade Profissional</th>
                  <th className="pb-3 pt-2 font-semibold">Como fazíamos antes (Lento)</th>
                  <th className="pb-3 pt-2 font-semibold text-teal-400">Como fazemos agora (Impulsionado com IA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-3 font-semibold text-slate-200">Pesquisas e Estudos</td>
                  <td className="py-3 text-slate-400">Passar horas abrindo 15 abas do Google, lidando com anúncios.</td>
                  <td className="py-3 text-teal-300 font-medium">Usar o Copilot ou Gemini para sintetizar o tema em 5 pontos-chave.</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-200">Elaboração de Currículo</td>
                  <td className="py-3 text-slate-400">Copia e cola de modelos prontos da internet sem personalidade.</td>
                  <td className="py-3 text-teal-300 font-medium">Melhorar a escrita de realizações profissionais e corrigir gramática.</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-200">Escrever e-mails e Relatórios</td>
                  <td className="py-3 text-slate-400">Bloqueio criativo da 'folha em branco' sem saber o tom profissional correto.</td>
                  <td className="py-3 text-teal-300 font-medium">Fornecer rascunhos em tópicos e pedir polimento de tom corporativo.</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-200">Aprender Programação</td>
                  <td className="py-3 text-slate-400">Decorar sintaxe de livros e travar em códigos com bugs inexplicáveis.</td>
                  <td className="py-3 text-teal-300 font-medium">Usar 'Vibe Coding' para criar protótipos rápidos explicando erros linha a linha.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-teal-500/10 rounded-xl border border-teal-500/20 text-center text-xs text-teal-300 max-w-xl mx-auto font-semibold">
            🎯 A IA acelera o seu aprendizado, mas nunca o substitui. Você continua sendo o curador!
          </div>
        </div>
      )
    },
    {
      title: "Laboratório Prático: Experimente agora!",
      subtitle: "Digite um prompt e observe as boas práticas aplicadas ao vivo",
      duration: "5 min",
      content: (
        <div className="space-y-4">
          <p className="text-xs text-slate-400 text-center">Teste a API do Gemini ao vivo escolhendo uma opção padrão ou customizando seu texto:</p>
          <div className="grid md:grid-cols-12 gap-4">
            {/* Lado do Input */}
            <div className="md:col-span-5 space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Modelos de Prompts Recomendados</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { text: "Dicas de Entrevista", prompt: "Aja como um recrutador técnico e faça 3 perguntas comuns para vagas de Jovem Aprendiz Administrativo, com conselhos sobre o que responder em cada uma." },
                  { text: "Melhorar Currículo", prompt: "Reescreva de forma formal e persuasiva o seguinte objetivo profissional para um jovem sem experiência: 'Procuro minha primeira oportunidade na empresa para crescer'." },
                  { text: "Aprender Programação", prompt: "Explique o que é uma variável e uma função em JavaScript para alguém de 14 anos usando a analogia de uma caixa de brinquedos." },
                  { text: "Organização de Rotina", prompt: "Crie um cronograma de estudos diário realista de 2 horas para quem trabalha à tarde e quer estudar desenvolvimento de software à noite." }
                ].map((btn, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPromptInput(btn.prompt)}
                    className="p-2 border border-slate-700/80 bg-slate-800/40 hover:bg-slate-800 text-slate-300 text-[10px] font-medium rounded-xl text-left transition-all leading-snug hover:border-teal-500/50"
                  >
                    💡 {btn.text}
                  </button>
                ))}
              </div>

              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Insira seu prompt aqui ou escolha um exemplo acima..."
                className="w-full h-24 p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono resize-none"
              />

              <button
                onClick={async () => {
                  if (!promptInput.trim()) return;
                  setIsLoadingPrompt(true);
                  setPromptLabError('');
                  setGeminiResponse('');

                  // Algoritmo de retry com exponential backoff
                  const maxRetries = 5;
                  const delays = [1000, 2000, 4000, 8000, 16000];
                  let success = false;
                  let responseText = '';

                  for (let attempt = 0; attempt < maxRetries; attempt++) {
                    try {
                      const response = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=`,
                        {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            contents: [{ parts: [{ text: promptInput }] }],
                            systemInstruction: {
                              parts: [{ text: "Você é um assistente educacional focado em ensinar Inteligência Artificial e capacitação profissional para jovens de baixa renda. Seja inspirador, didático, claro e direto nas respostas em português." }]
                            }
                          })
                        }
                      );

                      if (!response.ok) {
                        throw new Error(`Erro na chamada da API: ${response.status}`);
                      }

                      const data = await response.json();
                      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Nenhuma resposta obtida.";
                      success = true;
                      break; // sai do loop se der certo
                    } catch (err) {
                      if (attempt === maxRetries - 1) {
                        setPromptLabError("Infelizmente, todas as tentativas de conexão falharam. Verifique os dados e tente novamente.");
                        console.error(err);
                      } else {
                        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
                      }
                    }
                  }

                  if (success) {
                    setGeminiResponse(responseText);
                  }
                  setIsLoadingPrompt(false);
                }}
                disabled={isLoadingPrompt || !promptInput.trim()}
                className="w-full py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                {isLoadingPrompt ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                    Gemini Pensando...
                  </>
                ) : (
                  <>
                    <Icons.Send />
                    Enviar Prompt ao Vivo
                  </>
                )}
              </button>
            </div>

            {/* Lado do Output */}
            <div className="md:col-span-7 bg-slate-950 p-4 border border-slate-800 rounded-xl h-64 overflow-y-auto flex flex-col">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block mb-2 border-b border-slate-800 pb-1 flex items-center gap-2">
                🟢 Resposta do Gemini 2.5
              </span>
              {isLoadingPrompt && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 animate-pulse text-xs space-y-2">
                  <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  <p>Processando resposta estatisticamente word-by-word...</p>
                </div>
              )}
              {promptLabError && (
                <div className="flex-1 flex items-center justify-center text-red-400 text-xs text-center px-4 leading-relaxed">
                  ⚠️ {promptLabError}
                </div>
              )}
              {!isLoadingPrompt && !geminiResponse && !promptLabError && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-xs text-center">
                  <span>Os resultados da Inteligência Artificial aparecerão aqui instantaneamente.</span>
                </div>
              )}
              {!isLoadingPrompt && geminiResponse && (
                <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                  {geminiResponse}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Limitações e Ética: Não confie cegamente!",
      subtitle: "Toda Inteligência Artificial é falível, e você é o responsável",
      duration: "4 min",
      content: (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800/20 border border-slate-700/50 p-5 rounded-2xl space-y-3">
            <h4 className="font-bold text-red-400 flex items-center gap-2 text-sm">
              <Icons.Warning /> Alucinações
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              As IAs não compreendem o mundo real, elas apenas combinam padrões de palavras. Por isso, às vezes inventam leis, referências bibliográficas e dados históricos com enorme autoconfiança. É seu dever revisar tudo antes de entregar trabalhos escolares ou profissionais.
            </p>
          </div>

          <div className="bg-slate-800/20 border border-slate-700/50 p-5 rounded-2xl space-y-3">
            <h4 className="font-bold text-red-400 flex items-center gap-2 text-sm">
              👥 Vieses e Preconceitos
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              A IA aprende de dados coletados da internet que trazem preconceitos estruturais humanos. Se as bases de dados de recrutamento anteriores favoreciam apenas homens, o algoritmo pode replicar esse padrão preconceituoso. Devemos agir criticamente para evitar a exclusão.
            </p>
          </div>

          <div className="md:col-span-2 p-4 bg-teal-500/10 border border-teal-500/30 rounded-xl text-center">
            <h5 className="text-teal-400 font-bold text-xs">🛡️ O Círculo de Ouro da Verificação de Dados</h5>
            <p className="text-[11px] text-slate-400 mt-1 max-w-2xl mx-auto">
              Antes de usar qualquer resposta gerada por IA no seu trabalho, pergunte-se: <strong>"Isso faz sentido lógico?"</strong>, <strong>"Como posso comprovar essa informação em canais de mídia tradicionais?"</strong>.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "O Universo de Ferramentas que você deve dominar",
      subtitle: "Escolha o martelo certo para o prego certo",
      duration: "3 min",
      content: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Gemini", creator: "Google", goal: "Pesquisas seguras, geração de códigos e análises integradas ao Gmail/Docs.", badge: "Estudos & Tech", color: "border-blue-500/30" },
            { name: "ChatGPT", creator: "OpenAI", goal: "Assistente textual geral para brainstorm, cartas e formatação de conteúdos.", badge: "Polivalente", color: "border-teal-500/30" },
            { name: "NotebookLM", creator: "Google", goal: "Transforma seus PDFs e anotações de aula em resumos e tira-dúvidas inteligente.", badge: "Super Aluno", color: "border-purple-500/30" },
            { name: "Gamma App", creator: "Gamma", goal: "Cria slides e páginas web estruturadas em segundos com inteligência visual.", badge: "Apresentações", color: "border-pink-500/30" },
          ].map((tool, idx) => (
            <div key={idx} className={`p-4 bg-slate-800/30 border ${tool.color} rounded-xl hover:bg-slate-800 transition-all text-center flex flex-col justify-between h-full`}>
              <div>
                <span className="text-[10px] font-bold text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/60 uppercase">{tool.badge}</span>
                <h4 className="font-extrabold text-slate-100 text-sm mt-3">{tool.name}</h4>
                <p className="text-[10px] text-slate-500 font-medium mb-2">por {tool.creator}</p>
                <p className="text-[11px] text-slate-400 leading-normal">{tool.goal}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "O Futuro é Humano: Desenvolva seu Diferencial",
      subtitle: "A IA é o foguete, mas você é o piloto",
      duration: "3 min",
      content: (
        <div className="text-center space-y-4 max-w-2xl mx-auto flex flex-col justify-center h-full">
          <div className="w-16 h-16 bg-gradient-to-tr from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center text-slate-900 text-3xl font-extrabold shadow-lg mx-auto transform rotate-6 mb-2">
            ✨
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-100">
            "A Inteligência Artificial não veio substituir seu potencial, mas sim expandir o que você consegue construir."
          </h3>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-light mb-4">
            O verdadeiro diferencial competitivo no mercado não será saber usar uma única ferramenta de cor, mas sim o seu desejo de aprender constantemente, fazer perguntas profundas, manter a integridade ética e resolver problemas reais das pessoas.
          </p>
          
          <div className="pt-4 border-t border-slate-800/80">
            <p className="text-[11px] text-teal-400 font-bold uppercase tracking-widest mb-3">🚀 Continue sua jornada: Cursos Recomendados</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
               <a href="https://www.coursera.org/professional-certificates/google-ai" target="_blank" rel="noopener noreferrer" className="flex-1 p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-teal-500/50 rounded-xl transition-all text-left flex items-center gap-3 group">
                 <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">G</div>
                 <div>
                   <p className="text-[13px] font-bold text-slate-200 leading-tight">Google AI Fundamentals</p>
                   <p className="text-[10px] text-slate-400 mt-0.5">Coursera (Google)</p>
                 </div>
               </a>
               <a href="https://www.coursera.org/learn/generative-ai-for-everyone" target="_blank" rel="noopener noreferrer" className="flex-1 p-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-teal-500/50 rounded-xl transition-all text-left flex items-center gap-3 group">
                 <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">D</div>
                 <div>
                   <p className="text-[13px] font-bold text-slate-200 leading-tight">Generative AI for Everyone</p>
                   <p className="text-[10px] text-slate-400 mt-0.5">DeepLearning.AI</p>
                 </div>
               </a>
             </div>
          </div>
        </div>
      )
    }
  ];

  // Navegação manual de slides
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1 < slideContent.length ? prev + 1 : prev));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : prev));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased">
      {/* HEADER PRINCIPAL */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 md:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-teal-500 text-slate-900 rounded-xl flex items-center justify-center font-extrabold text-base tracking-wider shadow-lg">
            CJ
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-slate-100">CONECTA JOVEM</h1>
            <p className="text-[10px] text-slate-400 font-semibold">Tecnologia, Carreira & IA — WSNET</p>
          </div>
        </div>

        {/* SWITCH DE VIEW MODE (slides ou apostila) */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 border border-slate-800 rounded-xl">
          <button
            onClick={() => setViewMode('presenter')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'presenter' 
                ? 'bg-teal-500 text-slate-900 shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icons.Presenter />
            <span className="hidden md:inline">Modo Palestra</span>
          </button>
          <button
            onClick={() => setViewMode('book')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'book' 
                ? 'bg-teal-500 text-slate-900 shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icons.Book />
            <span className="hidden md:inline">Apostila Digital</span>
          </button>
        </div>
      </header>

      {/* VIEWPORT DINÂMICA */}
      {viewMode === 'presenter' ? (
        // ==========================================
        // LAYOUT DE SLIDES (MODO APRESENTAÇÃO)
        // ==========================================
        <main className="flex-1 flex flex-col p-4 md:p-8 justify-center relative overflow-hidden">
          <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center bg-slate-900/30 border border-slate-800/60 rounded-3xl p-6 md:p-12 relative shadow-2xl min-h-[480px]">
            
            {/* Indicador de Tópico superior do slide */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Slide {currentSlide + 1} de {slideContent.length}
              </span>
              <span className="px-2 py-0.5 bg-slate-800 border border-slate-700/80 rounded-full text-[9px] font-bold text-teal-400">
                ⏱️ Duração: {slideContent[currentSlide].duration}
              </span>
            </div>

            {/* Conteúdo Dinâmico do Slide */}
            <div className="flex-1 flex flex-col justify-center pt-8 pb-4">
              {slideContent[currentSlide].content}
            </div>

            {/* Barra de Rodapé / Controles do Slide */}
            <div className="pt-4 border-t border-slate-800/80 flex justify-between items-center mt-6">
              <div className="flex space-x-1">
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 rounded-xl transition-all"
                >
                  <Icons.ChevronLeft />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={currentSlide === slideContent.length - 1}
                  className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 rounded-xl transition-all"
                >
                  <Icons.ChevronRight />
                </button>
              </div>
            </div>
          </div>
        </main>
      ) : (
        // ==========================================
        // LAYOUT DE APOSTILA DIGITAL (MODO LEITURA COMPLETA)
        // ==========================================
        <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 grid md:grid-cols-12 gap-8">
          
          {/* Navegação Rápida Lateral */}
          <aside className="md:col-span-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl h-fit sticky top-24">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
              📖 Sumário da Apostila
            </h3>
            <div className="flex flex-col space-y-1">
              {slideContent.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`p-2.5 rounded-xl text-left text-xs font-semibold leading-tight transition-all flex items-start gap-2 ${
                    currentSlide === idx 
                      ? 'bg-teal-500/10 border border-teal-500/30 text-teal-400 shadow-sm' 
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${currentSlide === idx ? 'bg-teal-400' : 'bg-slate-600'}`} />
                  <div>
                    <p className="font-bold">{idx + 1}. {item.title}</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{item.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Conteúdo Detalhado de Leitura */}
          <article className="md:col-span-8 bg-slate-900/20 border border-slate-800/60 p-6 md:p-8 rounded-3xl space-y-6">
            
            {/* Header do Artigo */}
            <div className="border-b border-slate-800/80 pb-4">
              <span className="text-[10px] font-black tracking-widest text-teal-400 uppercase block mb-1">CAPÍTULO {currentSlide + 1}</span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-100">{slideContent[currentSlide].title}</h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">{slideContent[currentSlide].subtitle}</p>
            </div>

            {/* Widget Interativo Acoplado para Prática do Aluno */}
            <div className="p-4 md:p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
              {slideContent[currentSlide].content}
            </div>

            {/* Texto de Aprofundamento da Apostila (PDF) */}
            <div className="space-y-4 text-xs md:text-sm text-slate-300 leading-relaxed font-light">
              <h3 className="text-slate-100 font-bold text-sm">Aprofundando os Fundamentos:</h3>
              
              {currentSlide === 0 && (
                <>
                  <p>
                    Muitos jovens acreditam que a Inteligência Artificial é um conceito de 2023 ou que se resume unicamente ao robô inteligente do ChatGPT. Na realidade, esta ciência de computação tem mais de 70 anos de avanços contínuos.
                  </p>
                  <p>
                    Nosso maior objetivo com este guia é dar a você as bases da chamada <strong>Alfabetização em Inteligência Artificial (AI Literacy)</strong>. Compreendendo como essa engrenagem funciona por baixo do capô, você deixa de ser apenas um usuário comum e passa a agir como um projetista/criador de soluções inovadoras.
                  </p>
                </>
              )}
              {currentSlide === 1 && (
                <>
                  <p>
                    Do momento em que você acorda ao abrir o feed do Instagram até a hora de dormir com um podcast de ruído branco no Spotify, a IA já está agindo ativamente. O Waze calcula caminhos interpretando a movimentação gps de milhares de motoristas, enquanto as caixas de e-mail identificam padrões para filtrar o spam indesejado.
                  </p>
                  <p>
                    Compreender que o algoritmo já faz parte do nosso ecossistema social é o passo principal para aprender a modelar essas tecnologias para construir soluções que gerem real valor às pessoas.
                  </p>
                </>
              )}
              {currentSlide === 2 && (
                <>
                  <p>
                    Ao analisarmos a cronologia, vemos que nos anos 1950, Alan Turing já buscava responder se era viável imitar a cognição humana. Em 1997, a computação se consolida com a vitória do xadrez, provando a viabilidade de algoritmos lógicos e estocásticos resolverem quebra-cabeças complexos com extrema perfeição matemática.
                  </p>
                  <p>
                    O ápice tecnológico atual é movido por um aumento sem precedentes no poder das placas de vídeo (GPUs) e na massividade de dados disponíveis na internet mundial.
                  </p>
                </>
              )}
              {currentSlide === 3 && (
                <>
                  <p>
                    Pense na inteligência artificial como uma família russa de bonecas aninhadas (Matrioska): a maior de todas é a <strong>Inteligência Artificial</strong> geral. Dentro dela, temos o <strong>Machine Learning</strong> (o motor onde programas se autoajustam por dados). Menor ainda é o <strong>Deep Learning</strong> (redes neurais profundas de alta complexidade).
                  </p>
                  <p>
                    Por fim, na camada interna mais nova, temos a <strong>IA Generativa</strong>. Ela não serve apenas para classificar ou fazer previsões de preços, mas para criar novos formatos de dados, como imagens e códigos originais.
                  </p>
                </>
              )}
              {currentSlide === 4 && (
                <>
                  <p>
                    O treinamento de uma IA segue três paradigmas. No <strong>Supervisionado</strong>, agimos como professores: mostramos pares de dados de entrada e saída. No <strong>Não Supervisionado</strong>, ela é solta em alto-mar para achar padrões por afinidade (ótimo para descobrir fraudes ocultas em transações bancárias).
                  </p>
                  <p>
                    No aprendizado <strong>Por Reforço</strong>, emulamos a biologia: penalidades e recompensas estimulam a inteligência artificial a decifrar a melhor sequência de ações para dominar jogos ou navegar veículos autônomos.
                  </p>
                </>
              )}
              {currentSlide === 5 && (
                <>
                  <p>
                    Entenda este fato definitivo: a IA Generativa não é um banco de dados de papagaio. Ela calcula sequências probabilísticas. Ela entende quais termos ou pixels fazem mais sentido aparecer baseada na história e no contexto que você passou.
                  </p>
                  <p>
                    Por isso, textos ou imagens criados por IA são sempre inéditos, gerados sob medida. É o que as maiores referências globais do Google Cloud e Coursera chamam de transição da computação lógica estática para a computação estatística fluida.
                  </p>
                </>
              )}
              {currentSlide === 6 && (
                <>
                  <p>
                    Se o prompt de entrada for preguiçoso e vago, o modelo estatístico responderá de forma previsível e genérica. Quando passamos um <strong>Prompt Profissional</strong> repleto de detalhes (comunicação eficaz), damos à IA um norte firme e colhemos resultados formidáveis.
                  </p>
                  <p>
                    No início da carreira, saber arquitetar prompts cirúrgicos será o seu maior superpoder administrativo, poupando dezenas de horas de trabalho de formatação chata e pesquisa estéril.
                  </p>
                </>
              )}
              {currentSlide === 7 && (
                <>
                  <p>
                    Adotar um pensamento de colaboração é a chave ideal. Em vez de usar a inteligência artificial como um gerador fácil de trabalhos prontos para copiar e colar sem pensar, adote a IA como uma parceira de debate científico.
                  </p>
                  <p>
                    Com o advento do chamado <strong>Vibe Coding</strong> (um termo cunhado no Google AI Certificate), qualquer profissional júnior de administração ou saúde consegue programar pequenas soluções de automação interna sem necessariamente escrever nenhuma linha manual de linguagem técnica.
                  </p>
                </>
              )}
              {currentSlide === 8 && (
                <>
                  <p>
                    O Laboratório Prático de Prompts ao vivo acima ilustra exatamente o poder dessa ciência. Você pode alterar as palavras, os contextos e as diretivas para perceber como o Gemini reorganiza suas frases para atender a metas corporativas distintas.
                  </p>
                  <p>
                    Recomendamos testar e falhar ativamente na construção de prompts até captar de ouvido a 'tonalidade' ideal com a qual o cérebro estatístico da máquina responde de melhor maneira.
                  </p>
                </>
              )}
              {currentSlide === 9 && (
                <>
                  <p>
                    Sistemas inteligentes têm sérios pontos cegos. As <strong>alucinações</strong> acontecem porque o modelo prefere responder de maneira errada mas gramaticalmente fluida a admitir que não possui a informação histórica em sua memória de treinamento.
                  </p>
                  <p>
                    Além do risco de inventar leis ou citações que não existem, os modelos de IA herdam vieses sociais da internet de dados passados. Fique sempre atento para assegurar que seus entregáveis de trabalho respeitem leis civis e a LGPD de forma correta e sem discriminações.
                  </p>
                </>
              )}
              {currentSlide === 10 && (
                <>
                  <p>
                    Explore ativamente esse mar de novas possibilidades tecnológicas. Cada ferramenta tem sua proposta de valor e finalidade principal. Lembre-se sempre de ler as políticas de privacidade para manter a segurança e a integridade de dados privados seus e das corporações onde for atuar profissionalmente.
                  </p>
                </>
              )}
              {currentSlide === 11 && (
                <>
                  <p>
                    A maior virtude de um profissional na era da automação rápida não é possuir respostas estáticas prontas de cor e salteado. O valor definitivo reside em saber como aprender continuamente, gerir projetos complexos, ter curiosidade de cientista e empatia genuína para com as outras pessoas.
                  </p>
                  <p className="font-bold text-teal-400">
                    O Conecta Jovem WSNET está ao seu lado para construir este amanhã incrível. Boa jornada!🚀
                  </p>
                </>
              )}
            </div>

            {/* Navegador inferior para leitura */}
            <div className="pt-6 border-t border-slate-800/80 flex justify-between">
              <button
                onClick={() => {
                  if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
                }}
                disabled={currentSlide === 0}
                className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 disabled:opacity-40 text-xs font-bold border border-slate-750 rounded-xl transition-all"
              >
                ⬅️ Voltar Capítulo
              </button>
              <button
                onClick={() => {
                  if (currentSlide + 1 < slideContent.length) setCurrentSlide(prev => prev + 1);
                }}
                disabled={currentSlide === slideContent.length - 1}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-900 disabled:opacity-40 text-xs font-bold rounded-xl transition-all"
              >
                Avançar Capítulo ➡️
              </button>
            </div>
          </article>
        </main>
      )}

      {/* RODAPÉ DO APP */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-[10px] text-slate-500">
        <p>© 2026 Conecta Jovem — WSNET. Todos os direitos reservados.</p>
        <p className="mt-1">Inspirado nos currículos oficiais da Google AI Fundamentals e Generative AI for Everyone (DeepLearning.AI).</p>
      </footer>
    </div>
  );
}
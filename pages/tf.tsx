'use client'
import { useState, useEffect, useRef, KeyboardEvent } from "react";
import Head from "next/head";

type Question = {
  question: string;
  answer: boolean;
  category: string;
  explanation: string;
};

type GameState =
  | { phase: 'boot' }
  | { phase: 'category-select' }
  | { phase: 'question', index: number, typed: string, answered: boolean }
  | { phase: 'explanation', correct: boolean, index: number }
  | { phase: 'complete' };

export default function TrueFalse() {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({ phase: 'boot' });
  const [score, setScore] = useState(0);
  const [input, setInput] = useState("");
  const [bootText, setBootText] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  const categories = ['general knowledge', 'history', 'geography', 'food', 'technology'];

  // Load questions
  useEffect(() => {
    fetch('/data/tf-questions.json')
      .then(res => res.json())
      .then(data => {
        setAllQuestions(data);
      });
  }, []);

  // Boot sequence
  useEffect(() => {
    if (gameState.phase === 'boot' && allQuestions.length > 0) {
      const bootMessages = [
        "> INITIALIZING BRAIN.EXE...",
        "> LOADING QUESTIONS DATABASE...",
        "> ESTABLISHING SECURE CONNECTION...",
        "> CONNECTION ESTABLISHED",
        "> SYSTEM READY",
        "> [READY]",
      ];

      let index = 0;
      const interval = setInterval(() => {
        if (index < bootMessages.length) {
          setBootText(prev => [...prev, bootMessages[index]]);
          index++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setGameState({ phase: 'category-select' });
          }, 800);
        }
      }, 400);

      return () => clearInterval(interval);
    }
  }, [gameState.phase, allQuestions]);

  // Typing effect for questions
  useEffect(() => {
    if (gameState.phase === 'question' && !gameState.answered) {
      const currentQuestion = questions[gameState.index];
      if (!currentQuestion) return;

      const fullText = currentQuestion.question;
      let charIndex = 0;
      let isActive = true;

      const interval = setInterval(() => {
        if (!isActive) {
          clearInterval(interval);
          return;
        }

        if (charIndex <= fullText.length) {
          setGameState(prev => {
            // Only update if we're still in question phase
            if (prev.phase === 'question' && isActive) {
              return { ...prev, typed: fullText.slice(0, charIndex) };
            }
            return prev;
          });
          charIndex++;
        } else {
          clearInterval(interval);
        }
      }, 30);

      return () => {
        isActive = false;
        clearInterval(interval);
      };
    }
  }, [gameState.phase, gameState.phase === 'question' ? gameState.index : 0, questions]);

  const handleSubmit = () => {
    if (gameState.phase !== 'question') return;

    const normalized = input.toLowerCase().trim();
    const validTrue = ['true', 't', '1', 'yes', 'y'];
    const validFalse = ['false', 'f', '0', 'no', 'n'];

    let userAnswer: boolean | null = null;
    if (validTrue.includes(normalized)) {
      userAnswer = true;
    } else if (validFalse.includes(normalized)) {
      userAnswer = false;
    }

    if (userAnswer === null) {
      // Invalid command
      setInput("");
      return;
    }

    const currentQuestion = questions[gameState.index];
    const correct = userAnswer === currentQuestion.answer;

    if (correct) {
      setScore(prev => prev + 1);
    }

    setGameState({ phase: 'explanation', correct, index: gameState.index });
    setInput("");
  };

  // Listen for Enter key during explanation phase
  useEffect(() => {
    const handleContinueFromExplanation = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Enter' && gameState.phase === 'explanation') {
        if (gameState.index + 1 < questions.length) {
          setGameState({ phase: 'question', index: gameState.index + 1, typed: '', answered: false });
        } else {
          setGameState({ phase: 'complete' });
        }
      }
    };

    if (gameState.phase === 'explanation') {
      // Add a small delay to prevent the Enter key that submitted the answer from triggering this
      const timeoutId = setTimeout(() => {
        window.addEventListener('keydown', handleContinueFromExplanation);
      }, 300);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('keydown', handleContinueFromExplanation);
      };
    }
  }, [gameState, questions.length]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    }
  };

  // Focus category input when category select phase starts
  useEffect(() => {
    if (gameState.phase === 'category-select') {
      setTimeout(() => categoryInputRef.current?.focus(), 100);
    }
  }, [gameState.phase]);

  // Focus question input when question phase is ready
  useEffect(() => {
    if (gameState.phase === 'question' && gameState.typed === questions[gameState.index]?.question) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [gameState.phase, gameState.typed, gameState.phase === 'question' ? gameState.index : 0, questions]);

  const handleCategorySelect = () => {
    const normalized = categoryInput.toLowerCase().trim();

    // Check if input is a number (1-5)
    const categoryIndex = parseInt(normalized) - 1;
    let selectedCat: string | null = null;

    if (categoryIndex >= 0 && categoryIndex < categories.length) {
      selectedCat = categories[categoryIndex];
    } else {
      // Check if input matches a category name
      selectedCat = categories.find(cat => cat.toLowerCase() === normalized) || null;
    }

    if (!selectedCat) {
      // Invalid input
      setCategoryInput("");
      return;
    }

    setSelectedCategory(selectedCat);
    const filtered = allQuestions.filter(q => q.category === selectedCat);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setCategoryInput("");
    setTimeout(() => {
      setGameState({ phase: 'question', index: 0, typed: '', answered: false });
    }, 500);
  };

  const handleCategoryKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleCategorySelect();
    }
  };

  const getFinalMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return "> ELITE STATUS ACHIEVED. WELCOME TO THE GIBSON.";
    if (percentage >= 80) return "> ACCESS GRANTED. YOU ARE ONE OF US.";
    if (percentage >= 60) return "> PARTIAL ACCESS GRANTED. KEEP LEARNING.";
    if (percentage >= 40) return "> UNAUTHORIZED. UPGRADE YOUR WETWARE.";
    return "> CRASH AND BURN. BACK TO THE BASICS, SCRIPT KIDDIE.";
  };

  // Click anywhere to focus appropriate input
  const handleContainerClick = () => {
    if (gameState.phase === 'category-select') {
      categoryInputRef.current?.focus();
    } else if (gameState.phase === 'question' && gameState.typed === questions[gameState.index]?.question) {
      inputRef.current?.focus();
    }
  };

  return (
    <>
      <Head>
        <title>True/False Terminal - WreckItRob</title>
      </Head>
      <div className="terminal-container" onClick={handleContainerClick}>
        <style jsx>{`
          .terminal-container {
            min-height: 100vh;
            background: #000000;
            color: #00ff00;
            font-family: 'Courier New', Courier, Monaco, monospace;
            padding: 2rem;
            position: relative;
            overflow: hidden;
            cursor: text;
          }

          .terminal-header {
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #00ff00;
          }

          .terminal-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
            text-shadow: 0 0 10px #00ff00;
          }

          .terminal-output {
            margin-bottom: 1rem;
            line-height: 1.6;
          }

          .boot-line {
            margin: 0.3rem 0;
            opacity: 0;
            animation: fadeIn 0.3s forwards;
          }

          @keyframes fadeIn {
            to {
              opacity: 1;
            }
          }

          .question-header {
            color: #00ff00;
            margin-bottom: 1rem;
            font-weight: bold;
          }

          .question-text {
            color: #00ff00;
            margin-bottom: 2rem;
            font-size: 1.1rem;
            min-height: 3rem;
          }

          .cursor {
            animation: blink 1s infinite;
          }

          @keyframes blink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }

          .terminal-prompt {
            display: flex;
            align-items: center;
            margin-top: 1rem;
          }

          .prompt-symbol {
            color: #00ff00;
            margin-right: 0.5rem;
            font-weight: bold;
          }

          .terminal-input {
            background: transparent;
            border: none;
            color: #00ff00;
            font-family: 'Courier New', Courier, Monaco, monospace;
            font-size: 1rem;
            outline: none;
            flex: 1;
            caret-color: #00ff00;
          }

          .feedback-message {
            margin: 1rem 0;
            font-weight: bold;
            font-size: 1.1rem;
          }

          .feedback-correct {
            color: #00ff00;
            text-shadow: 0 0 10px #00ff00;
          }

          .feedback-wrong {
            color: #ff0000;
            text-shadow: 0 0 10px #ff0000;
          }

          .score-display {
            color: #00ff00;
            font-weight: bold;
            margin: 0.5rem 0;
          }

          .complete-screen {
            text-align: center;
            padding: 2rem;
          }

          .final-score {
            font-size: 2rem;
            margin: 2rem 0;
            text-shadow: 0 0 20px #00ff00;
          }

          .final-message {
            font-size: 1.2rem;
            margin: 1rem 0;
          }

          .scanline {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              to bottom,
              transparent 50%,
              rgba(0, 255, 0, 0.03) 51%
            );
            background-size: 100% 4px;
            pointer-events: none;
            animation: scan 8s linear infinite;
          }

          @keyframes scan {
            0% {
              background-position: 0 0;
            }
            100% {
              background-position: 0 100%;
            }
          }

          .crt-effect {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
            pointer-events: none;
          }

          .category-select {
            margin: 2rem 0;
          }

          .category-list {
            margin: 1.5rem 0;
            line-height: 1.6;
          }

          .category-instruction {
            margin: 1rem 0;
            font-size: 1.1rem;
            font-weight: bold;
            opacity: 0.9;
          }

          @media (max-width: 768px) {
            .terminal-container {
              padding: 1rem;
            }

            .terminal-title {
              font-size: 1.2rem;
            }

            .question-text {
              font-size: 1rem;
            }
          }
        `}</style>

        {/* CRT Effects */}
        <div className="scanline"></div>
        <div className="crt-effect"></div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="terminal-header">
            <div className="terminal-title">
              {">"} BRAIN.EXE - TRUE/FALSE PROTOCOL
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              root@wreckitrob:~#
            </div>
          </div>

          {gameState.phase === 'boot' && (
            <div className="terminal-output">
              {bootText.map((line, idx) => (
                <div key={idx} className="boot-line" style={{ animationDelay: `${idx * 0.1}s` }}>
                  {line}
                </div>
              ))}
            </div>
          )}

          {gameState.phase === 'category-select' && (
            <div className="category-select">
              <div className="category-instruction">
                {">"} SELECT KNOWLEDGE DOMAIN:
              </div>
              <div className="category-list">
                {categories.map((category, idx) => (
                  <div key={category} style={{ margin: '0.3rem 0', fontSize: '1rem' }}>
                    {">"} [{idx + 1}] {category.toUpperCase()}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', opacity: 0.8 }}>
                {">"} Enter number (1-5) or category name...
              </div>
              <div className="terminal-prompt" style={{ marginTop: '1rem' }}>
                <span className="prompt-symbol">root@wreckitrob:~$</span>
                <input
                  ref={categoryInputRef}
                  type="text"
                  className="terminal-input"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  onKeyDown={handleCategoryKeyDown}
                  autoFocus
                />
                <span className="cursor">█</span>
              </div>
            </div>
          )}

          {gameState.phase === 'question' && (
            <div>
              <div className="question-header">
                [QUESTION {gameState.index + 1}/{questions.length}] [SCORE: {score}/{gameState.index}]
              </div>
              <div className="question-text">
                {">"} {gameState.typed}
                {gameState.typed.length < questions[gameState.index]?.question.length && (
                  <span className="cursor">█</span>
                )}
              </div>
              {gameState.typed.length === questions[gameState.index]?.question.length && (
                <div className="terminal-prompt">
                  <span className="prompt-symbol">root@wreckitrob:~$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    className="terminal-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="true or false?"
                    autoFocus
                  />
                  <span className="cursor">█</span>
                </div>
              )}
            </div>
          )}

          {gameState.phase === 'explanation' && (
            <div>
              <div className="question-header">
                [QUESTION {gameState.index + 1}/{questions.length}] [SCORE: {score}/{gameState.index + 1}]
              </div>

              <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(0, 255, 0, 0.05)', border: '1px solid #00ff00' }}>
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                  {">"} QUESTION:
                </div>
                <div style={{ fontSize: '1rem' }}>
                  {questions[gameState.index]?.question}
                </div>
                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
                  {">"} CORRECT ANSWER: {questions[gameState.index]?.answer ? 'TRUE' : 'FALSE'}
                </div>
              </div>

              {gameState.correct ? (
                <div className="feedback-message feedback-correct">
                  {">"} ACCESS GRANTED - CORRECT!
                </div>
              ) : (
                <div className="feedback-message feedback-wrong">
                  {">"} ERROR 404: Brains not found, please try another command
                </div>
              )}

              <div style={{ margin: '1.5rem 0', padding: '1rem', borderLeft: '2px solid #00ff00', paddingLeft: '1rem' }}>
                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  {">"} EXPLANATION:
                </div>
                <div style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                  {questions[gameState.index]?.explanation}
                </div>
              </div>

              <div style={{ marginTop: '2rem', fontSize: '0.95rem', opacity: 0.9, animation: 'blink 1.5s infinite' }}>
                {">"} Press ENTER to continue...
              </div>
            </div>
          )}

          {gameState.phase === 'complete' && (
            <div className="complete-screen">
              <div className="final-score">
                {">"} FINAL SCORE: {score}/{questions.length}
              </div>
              <div className="final-message">
                {getFinalMessage()}
              </div>
              <div style={{ marginTop: '3rem', fontSize: '0.9rem', opacity: 0.7 }}>
                {">"} PROTOCOL COMPLETE
                <br />
                {">"} CONNECTION TERMINATED
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

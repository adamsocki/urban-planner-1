import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeId } from '../types/theme';

const ThemeSwitcher: React.FC = () => {
  const { themeId, setThemeId, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themeList = Object.values(availableThemes);

  const handleThemeChange = (id: ThemeId) => {
    setThemeId(id);
    setIsOpen(false);
  };

  return (
    <>
      <style>{`
        .theme-switcher-container {
          position: fixed;
          bottom: var(--spacing-medium, 24px);
          right: var(--spacing-medium, 24px);
          z-index: 1000;
        }

        .theme-switcher-button {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full, 50%);
          background: var(--color-primary);
          color: var(--color-textInverse);
          border: 2px solid var(--color-border);
          box-shadow: var(--shadow-large);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          transition: var(--effect-transition);
          font-family: var(--typography-fontFamily);
        }

        .theme-switcher-button:hover {
          transform: scale(1.1) rotate(45deg);
          box-shadow: var(--shadow-hover);
        }

        .theme-switcher-panel {
          position: absolute;
          bottom: 72px;
          right: 0;
          width: 360px;
          max-height: 600px;
          overflow-y: auto;
          background: var(--color-surface);
          border: 2px solid var(--color-border);
          border-radius: var(--radius-large);
          box-shadow: var(--shadow-large);
          backdrop-filter: blur(var(--effect-blur, 0px));
          padding: var(--spacing-small);
          opacity: 0;
          transform: translateY(20px) scale(0.95);
          pointer-events: none;
          transition: var(--effect-transition);
        }

        .theme-switcher-panel.open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: all;
        }

        .theme-switcher-panel::-webkit-scrollbar {
          width: 8px;
        }

        .theme-switcher-panel::-webkit-scrollbar-track {
          background: var(--color-backgroundSecondary);
          border-radius: var(--radius-small);
        }

        .theme-switcher-panel::-webkit-scrollbar-thumb {
          background: var(--color-primary);
          border-radius: var(--radius-small);
        }

        .theme-switcher-header {
          font-family: var(--typography-headingFamily);
          font-weight: var(--typography-headingWeight);
          font-size: 18px;
          color: var(--color-text);
          margin-bottom: var(--spacing-small);
          padding: var(--spacing-small);
          border-bottom: 2px solid var(--color-border);
        }

        .theme-option {
          padding: var(--spacing-small);
          margin-bottom: var(--spacing-base);
          border: 2px solid var(--color-borderLight);
          border-radius: var(--radius-medium);
          cursor: pointer;
          transition: var(--effect-transition);
          background: var(--color-backgroundSecondary);
        }

        .theme-option:hover {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-hover);
          transform: translateX(-4px);
        }

        .theme-option.active {
          border-color: var(--color-primary);
          background: var(--color-surface);
          box-shadow: var(--shadow-medium);
        }

        .theme-option-name {
          font-family: var(--typography-headingFamily);
          font-weight: var(--typography-headingWeight);
          font-size: 16px;
          color: var(--color-text);
          margin-bottom: 4px;
        }

        .theme-option-description {
          font-family: var(--typography-fontFamily);
          font-weight: var(--typography-bodyWeight);
          font-size: 13px;
          color: var(--color-textSecondary);
          line-height: 1.4;
        }

        .theme-option-preview {
          display: flex;
          gap: 6px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .theme-color-dot {
          width: 20px;
          height: 20px;
          border-radius: var(--radius-full);
          border: 1px solid var(--color-border);
        }

        .theme-switcher-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 999;
          display: none;
        }

        .theme-switcher-overlay.open {
          display: block;
        }

        @media (max-width: 640px) {
          .theme-switcher-panel {
            width: calc(100vw - 32px);
            max-width: 360px;
          }
        }
      `}</style>

      <div className="theme-switcher-container">
        <div
          className={`theme-switcher-overlay ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(false)}
        />

        <button
          className="theme-switcher-button"
          onClick={() => setIsOpen(!isOpen)}
          title="Change Theme"
          aria-label="Change Theme"
        >
          🎨
        </button>

        <div className={`theme-switcher-panel ${isOpen ? 'open' : ''}`}>
          <div className="theme-switcher-header">
            Choose Your Style ({themeList.length} themes)
          </div>

          {themeList.map((t) => (
            <div
              key={t.id}
              className={`theme-option ${t.id === themeId ? 'active' : ''}`}
              onClick={() => handleThemeChange(t.id as ThemeId)}
            >
              <div className="theme-option-name">{t.name}</div>
              <div className="theme-option-description">{t.description}</div>
              <div className="theme-option-preview">
                <div
                  className="theme-color-dot"
                  style={{ background: t.colors.primary }}
                  title="Primary"
                />
                <div
                  className="theme-color-dot"
                  style={{ background: t.colors.secondary }}
                  title="Secondary"
                />
                <div
                  className="theme-color-dot"
                  style={{ background: t.colors.accent }}
                  title="Accent"
                />
                <div
                  className="theme-color-dot"
                  style={{ background: t.colors.success }}
                  title="Success"
                />
                <div
                  className="theme-color-dot"
                  style={{ background: t.colors.warning }}
                  title="Warning"
                />
                <div
                  className="theme-color-dot"
                  style={{ background: t.colors.error }}
                  title="Error"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ThemeSwitcher;

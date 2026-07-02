const GlobalScrollbar = () => {
  return (
    <style>{`
      :root {
        --global-scrollbar-track: rgba(127, 127, 127, 0.12);
        --global-scrollbar-thumb: #686a6d;
        --global-scrollbar-thumb-hover: #ee6b1f;
      }

      html,
      body,
      * {
        scrollbar-width: thin !important;
        scrollbar-color: var(--global-scrollbar-thumb) var(--global-scrollbar-track) !important;
      }

      html::-webkit-scrollbar,
      body::-webkit-scrollbar,
      *::-webkit-scrollbar {
        width: 10px !important;
        height: 10px !important;
      }

      html::-webkit-scrollbar-track,
      body::-webkit-scrollbar-track,
      *::-webkit-scrollbar-track {
        background: var(--global-scrollbar-track) !important;
        border-radius: 999px !important;
      }

      html::-webkit-scrollbar-thumb,
      body::-webkit-scrollbar-thumb,
      *::-webkit-scrollbar-thumb {
        min-height: 40px;
        background: var(--global-scrollbar-thumb) !important;
        border: 2px solid transparent !important;
        border-radius: 999px !important;
        background-clip: padding-box !important;
      }

      html::-webkit-scrollbar-thumb:hover,
      body::-webkit-scrollbar-thumb:hover,
      *::-webkit-scrollbar-thumb:hover {
        background: var(--global-scrollbar-thumb-hover) !important;
        background-clip: padding-box !important;
      }

      html::-webkit-scrollbar-button,
      body::-webkit-scrollbar-button,
      *::-webkit-scrollbar-button {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }

      html::-webkit-scrollbar-corner,
      body::-webkit-scrollbar-corner,
      *::-webkit-scrollbar-corner {
        background: transparent !important;
      }
    `}</style>
  );
};

export default GlobalScrollbar;

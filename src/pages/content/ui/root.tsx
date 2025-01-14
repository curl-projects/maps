import { createRoot } from 'react-dom/client';
import App from '@pages/content/ui/app';
import refreshOnUpdate from 'virtual:reload-on-update-in-view';
import injectedStyle from './injected.css?inline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ShadowHostProvider from "@pages/content/ui/ScriptHelpers/ShadowHostProvider/ShadowHostProvider.jsx"
import FishOrchestrationProvider from "@pages/content/ui/ScriptHelpers/FishOrchestrationProvider/FishOrchestrationProvider.jsx"
refreshOnUpdate('pages/content');

const root = document.createElement('div');
root.id = 'goals-extension-content-view-root';

document.body.append(root);

const rootIntoShadow = document.createElement('div');
rootIntoShadow.id = 'shadow-root';

const shadowRoot = root.attachShadow({ mode: 'open' });
shadowRoot.appendChild(rootIntoShadow);

/** Inject styles into shadow dom */
const styleElement = document.createElement('style');
styleElement.innerHTML = injectedStyle;
shadowRoot.appendChild(styleElement);

const queryClient = new QueryClient();

/**
 * https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/pull/174
 *
 * In the firefox environment, the adoptedStyleSheets bug may prevent contentStyle from being applied properly.
 * Please refer to the PR link above and go back to the contentStyle.css implementation, or raise a PR if you have a better way to improve it.
 */

createRoot(rootIntoShadow).render(
    <QueryClientProvider client={queryClient}>
        <FishOrchestrationProvider>
            {/* <ShadowHostProvider> */}
                <App />
            {/* </ShadowHostProvider> */}
        </FishOrchestrationProvider>
    </QueryClientProvider>
);

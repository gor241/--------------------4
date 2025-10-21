import { OnlineProvider } from './app/providers/OnlineProvider';
import { Converter } from './features/Converter/Converter';

export default function App(): JSX.Element {
  return (
    <OnlineProvider>
      <Converter />
    </OnlineProvider>
  );
}

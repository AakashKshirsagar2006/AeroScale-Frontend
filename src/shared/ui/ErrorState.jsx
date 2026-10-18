import { CloudOff } from 'lucide-react';
import { parseApiError } from '../http/errors';
import { Button } from './Button';
import { EmptyState } from './EmptyState';

export const ErrorState = ({ error, onRetry, title = 'Could not load this' }) => (
  <EmptyState
    icon={CloudOff}
    title={title}
    text={error ? parseApiError(error).message : undefined}
    action={onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}
  />
);

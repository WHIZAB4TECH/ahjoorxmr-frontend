import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const NoResults: Story = { args: { title: 'No results found', description: 'Try adjusting your search.' } };
export const WithAction: Story = { args: { title: 'No data yet', description: 'Create your first item.', action: { label: 'Get started', onClick: () => {} } } };
export const EmptyInbox: Story = { args: { title: 'All caught up!', description: 'No new notifications.' } };

# Book Records Web Application

This is a Next.js book tracking application for college students with comprehensive testing and security best practices.

## Project Type

- Framework: Next.js 14+ with App Router
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS
- Storage: localStorage (client-side)
- Testing: Jest + React Testing Library + Playwright
- CI/CD: GitHub Actions
- Deployment: Vercel

## Features

- Track books with different statuses (Currently Reading, Want to Read, Completed)
- Library book return date tracking with overdue warnings
- Reading deadline management
- Daily page goal calculator
- Image storage using base64 encoding (500KB limit per image)
- Export/Import JSON data with validation
- Search and filter functionality
- Statistics dashboard
- No backend or database required

## Code Quality Standards

### Security

- **Input Validation**: Always validate imported JSON data structure before processing
- **XSS Prevention**: Sanitize user inputs, especially for image uploads and text fields
- **localStorage Safety**: Implement quota exceeded error handling
- **URL Object Cleanup**: Revoke object URLs created with `URL.createObjectURL()` to prevent memory leaks

### Performance

- **Memoization**: Use `useMemo()` for expensive computations (filtering, sorting)
- **Callback Optimization**: Use `useCallback()` for event handlers passed to child components
- **Image Optimization**: Enforce 500KB limit on base64 images, compress before storage
- **Lazy Loading**: Consider code splitting for components not needed on initial render

### Accessibility

- **ARIA Labels**: All interactive elements must have accessible labels
- **Keyboard Navigation**: Ensure all functionality is keyboard accessible
- **Focus Management**: Manage focus when opening/closing modals
- **Semantic HTML**: Use proper heading hierarchy and semantic elements

### Type Safety

- **Strict TypeScript**: No `any` types unless absolutely necessary
- **Type Guards**: Implement runtime type validation for external data
- **Proper Interfaces**: Define interfaces for all data structures
- **Null Checks**: Handle null/undefined cases explicitly

### Testing Requirements

- **Unit Tests**: Test all utility functions in `app/utils/`
- **Component Tests**: Test rendering, user interactions, and edge cases
- **E2E Tests**: Test critical user workflows (add/edit/delete, search, filter)
- **Coverage Goals**: Maintain >80% code coverage for business logic
- **Test Structure**: Follow AAA pattern (Arrange, Act, Assert)

### Error Handling

- **User Feedback**: Show user-friendly error messages with toast/alert
- **Graceful Degradation**: Handle localStorage failures gracefully
- **Validation Errors**: Provide specific validation error messages
- **Network Failures**: Handle import/export file read errors

### Code Organization

- **Component Structure**: Keep components small and focused (single responsibility)
- **Custom Hooks**: Extract reusable logic into custom hooks
- **Utility Functions**: Pure functions in `app/utils/` should have no side effects
- **File Structure**:
  ```
  app/
  ├── components/       # Reusable UI components
  ├── utils/           # Pure utility functions
  ├── types/           # TypeScript interfaces
  ├── __tests__/       # Unit and component tests
  └── page.tsx         # Main application page
  ```

## Development Workflow

### Before Committing

1. Run `npm run lint` - Fix all ESLint errors
2. Run `npm run test` - All tests must pass
3. Run `npm run build` - Ensure production build succeeds
4. Check test coverage - `npm run test:coverage`

### Testing Commands

- `npm run test` - Run unit and component tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run Playwright E2E tests
- `npm run test:ci` - Run all tests (for CI/CD)

### Common Patterns

#### localStorage Operations

```typescript
// Always handle errors
try {
  localStorage.setItem(key, JSON.stringify(data));
} catch (error) {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    alert('Storage quota exceeded. Please delete some books or images.');
  }
  console.error('Storage error:', error);
}
```

#### Input Validation

```typescript
// Validate structure before use
function isValidBook(obj: any): obj is Book {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    // ... validate all required fields
  );
}
```

#### React Optimization

```typescript
// Memoize filtered results
const filteredBooks = useMemo(() => {
  return books.filter(/* ... */);
}, [books, searchTerm, statusFilter]);

// Memoize callbacks
const handleDelete = useCallback(
  (id: string) => {
    // implementation
  },
  [dependencies]
);
```

## Known Issues & Limitations

- localStorage limit: ~5-10MB depending on browser
- Images stored as base64 (increases size by ~33%)
- No backend: data is client-side only
- No authentication: anyone with access to browser can see data
- E2E tests may need label updates for form interactions

## Future Enhancements

- Add data export to CSV format
- Implement undo/redo functionality
- Add dark mode support
- Create progressive reading statistics
- Add book recommendation based on reading history

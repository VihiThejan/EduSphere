# Contributing to EduSphere

Thank you for your interest in contributing to EduSphere! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Project Structure](#project-structure)

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/EduSphere.git
   cd EduSphere
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/VihiThejan/EduSphere.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Set up environment variables** (see SETUP.md)
6. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Before Starting Work

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/feature-name
   # or
   git checkout -b fix/bug-name
   ```

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/video-comments`)
- `fix/` - Bug fixes (e.g., `fix/login-error`)
- `refactor/` - Code refactoring (e.g., `refactor/api-structure`)
- `docs/` - Documentation updates (e.g., `docs/api-examples`)
- `test/` - Adding tests (e.g., `test/auth-integration`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Making Changes

1. **Make your changes** in the appropriate package:
   - Frontend: `packages/client/src/`
   - Backend: `packages/server/src/`
   - Shared: `packages/shared/src/`

2. **Test your changes** locally:
   ```bash
   npm run dev
   ```

3. **Follow code standards** (see below)

4. **Write/update tests** if applicable

## Code Standards

### TypeScript

- Use TypeScript strict mode
- Always define types explicitly
- Avoid `any` type unless absolutely necessary
- Use interfaces for object shapes
- Use enums for constants

**Example:**
```typescript
// ✅ Good
interface CreateCourseInput {
  title: string;
  description: string;
  level: CourseLevel;
}

// ❌ Bad
interface CreateCourseInput {
  title: any;
  description: any;
  level: any;
}
```

### Naming Conventions

- **Variables/Functions**: camelCase (`getUserById`, `isAuthenticated`)
- **Classes/Interfaces/Types**: PascalCase (`UserService`, `CourseInterface`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE`)
- **Files**: 
  - Components: PascalCase (`LoginPage.tsx`, `VideoPlayer.tsx`)
  - Others: kebab-case (`user.service.ts`, `auth.middleware.ts`)

### Code Formatting

We use **Prettier** for consistent formatting:

```bash
# Format all code
npm run format

# Check formatting
npm run format:check
```

Configuration in `.prettierrc`:
- 2 spaces indentation
- Single quotes
- Semicolons required
- 100 character line width

### Linting

We use **ESLint** for code quality:

```bash
# Lint all code
npm run lint

# Auto-fix issues
npm run lint:fix
```

### File Organization

#### Backend Structure

```
packages/server/src/
├── config/              # Configuration files
├── modules/             # Feature modules
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.routes.ts
│   └── users/
│       ├── user.model.ts
│       ├── user.controller.ts
│       └── user.routes.ts
├── shared/              # Shared utilities
│   ├── middleware/
│   └── utils/
├── app.ts               # Express setup
└── server.ts            # Entry point
```

#### Frontend Structure

```
packages/client/src/
├── components/          # Reusable components
│   ├── common/          # Generic UI components
│   └── features/        # Feature-specific components
├── pages/               # Page components
├── services/            # API services
│   └── api/
├── store/               # State management
├── hooks/               # Custom React hooks
├── utils/               # Utility functions
├── types/               # Additional types
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Commit Guidelines

We follow **Conventional Commits** specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
# Feature
git commit -m "feat(courses): add course search functionality"

# Bug fix
git commit -m "fix(auth): resolve token refresh loop issue"

# Documentation
git commit -m "docs(api): update enrollment endpoints documentation"

# Multiple lines
git commit -m "feat(video): implement video streaming

- Add HTTP range support for video streaming
- Implement progress tracking
- Add access control checks

Closes #123"
```

### Scope Guidelines

- `auth` - Authentication related
- `courses` - Course management
- `videos` - Video handling
- `enrollments` - Enrollment system
- `ui` - UI/UX changes
- `api` - API changes
- `db` - Database changes
- `config` - Configuration changes

## Pull Request Process

### Before Submitting

1. **Update your branch** with latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Check linting**:
   ```bash
   npm run lint
   ```

4. **Format code**:
   ```bash
   npm run format
   ```

5. **Build successfully**:
   ```bash
   npm run build
   ```

### Creating a Pull Request

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** on GitHub

3. **Fill out the PR template**:
   - Description of changes
   - Related issues
   - Screenshots (if UI changes)
   - Testing steps

4. **Request review** from team members

### PR Title Format

Follow the same format as commit messages:

```
feat(courses): add course search functionality
fix(auth): resolve token refresh issue
docs(api): update API documentation
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Related Issues
Closes #123
Related to #456

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally

## Screenshots (if applicable)
[Add screenshots here]
```

### Code Review

- Be respectful and constructive
- Address all review comments
- Update PR based on feedback
- Request re-review after changes

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Test specific package
npm test --workspace=@edusphere/server
```

### Writing Tests

#### Backend Tests

```typescript
// Example: auth.test.ts
describe('Auth Service', () => {
  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test1234',
        firstName: 'Test',
        lastName: 'User',
        roles: ['student'],
      };

      const user = await authService.register(userData);

      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });
  });
});
```

#### Frontend Tests

```typescript
// Example: LoginPage.test.tsx
describe('LoginPage', () => {
  it('should display validation errors for invalid email', async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });
});
```

## Environment Variables

Never commit `.env` files. Use `.env.example` as template:

```bash
# Update .env.example when adding new variables
cp packages/server/.env packages/server/.env.example
# Then remove sensitive values from .env.example
```

## Database Migrations

When making schema changes:

1. Update Mongoose models
2. Update TypeScript interfaces in shared package
3. Update validators if needed
4. Consider backward compatibility
5. Document breaking changes

## API Changes

When modifying API:

1. Update controller and service
2. Update validators
3. Update API documentation (API.md)
4. Update frontend API client if needed
5. Test endpoints thoroughly

## Documentation

- Update README.md for major changes
- Update API.md for API changes
- Update SETUP.md for setup changes
- Add JSDoc comments for complex functions
- Keep code comments up to date

## Common Tasks

### Adding a New Feature

1. Create feature branch
2. Backend:
   - Add model (if needed)
   - Add service layer
   - Add controller
   - Add routes
   - Add validation
3. Frontend:
   - Add API service
   - Add UI components
   - Add pages/routes
   - Add state management
4. Update shared types
5. Write tests
6. Update documentation

### Fixing a Bug

1. Create fix branch
2. Write failing test (if possible)
3. Fix the bug
4. Ensure test passes
5. Update documentation if needed
6. Submit PR with clear description

## Getting Help

- Check existing issues on GitHub
- Ask in team communication channels
- Refer to documentation (SETUP.md, API.md)
- Review existing code for patterns

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Provide constructive feedback
- Focus on the code, not the person
- Assume good intentions

## License

By contributing, you agree that your contributions will be licensed under the project's license.

---

Thank you for contributing to EduSphere! 🎓🚀

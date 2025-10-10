# 📚 Book Records

A lightweight, personal book tracking web application designed for college students to manage their reading journey. Built with Next.js and deployed on Vercel with no backend or database required.

## ✨ Features

### 📖 Book Management
- **Track Multiple Statuses**: Currently Reading, Want to Read, Completed
- **Book Sources**: Library, Personal, Borrowed, Digital, or Other
- **Cover Images**: Upload book covers (stored as base64, max 500KB)
- **Rich Metadata**: Title, author, pages, current progress, and notes

### ⏰ Deadline Management
- **Library Return Dates**: Track when library books are due
- **Reading Deadlines**: Set personal deadlines for books
- **Visual Warnings**: Color-coded alerts for overdue and upcoming deadlines
- **Daily Page Goals**: Automatic calculation of how many pages to read per day to meet your deadline

### 📊 Progress Tracking
- **Visual Progress Bars**: See completion percentage at a glance
- **Reading Statistics**: Total books, pages read, completion rate
- **Smart Sorting**: Currently reading books appear first

### 🔍 Search & Filter
- **Full-Text Search**: Search by title, author, or notes
- **Status Filters**: Filter by reading status
- **Export/Import**: Backup and restore your data as JSON

## 🚀 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: localStorage (client-side only)
- **Deployment**: Vercel

## 📦 Installation

1. **Clone or download this project**
   ```bash
   git clone <your-repo-url>
   cd BookRecords
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy to Vercel

### One-Click Deploy

The easiest way to deploy is using Vercel:

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Click "Deploy"

That's it! Vercel will automatically detect Next.js and configure everything.

### Manual Deploy

1. Install Vercel CLI
   ```bash
   npm install -g vercel
   ```

2. Deploy
   ```bash
   vercel
   ```

3. Follow the prompts to complete deployment

## 💡 Usage Guide

### Adding a Book

1. Click the **"+ Add Book"** button
2. Fill in the book details:
   - **Required**: Title, Author, Status
   - **Optional**: Total pages, current page, cover image, return date, deadline, notes
3. Click **"Add Book"**

### Tracking Progress

1. Edit a book by clicking the edit icon
2. Update the **Current Page** field
3. The app will automatically:
   - Calculate your reading progress
   - Show updated completion percentage
   - Recalculate daily page goals if you have a deadline

### Managing Library Books

1. Set the source to **"Library"**
2. Enter the **Return Date**
3. The app will show:
   - Days remaining until return
   - Warning colors (orange for 3 days or less, red for overdue)

### Setting Reading Goals

1. Enter **Total Pages** and **Current Page**
2. Set a **Reading Deadline**
3. The app displays how many pages to read per day

### Backup & Restore

- **Export**: Click "📥 Export Data" to download a JSON backup
- **Import**: Click "📤 Import Data" to restore from a JSON file

## 📱 Features in Detail

### Daily Page Goal Calculator

When you have a book with:
- Total pages set
- Current page tracked
- Deadline specified

The app automatically calculates:
```
Pages Remaining = Total Pages - Current Page
Days Remaining = Deadline Date - Today
Daily Goal = Pages Remaining ÷ Days Remaining
```

### Image Storage

Book cover images are stored as base64 strings in localStorage:
- Maximum size: 500KB per image
- Formats: Any image format (JPEG, PNG, etc.)
- Stored locally with your book data

### Data Persistence

All data is stored in your browser's localStorage:
- No server required
- Data persists across sessions
- Private and offline-capable
- Can be exported/imported for backup

## 🎨 Customization

### Changing Colors

Edit `app/globals.css` to customize the color scheme:
```css
:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}
```

### Adding Book Sources

Edit `app/types/book.ts` to add more sources:
```typescript
export type BookSource = 'library' | 'personal' | 'borrowed' | 'digital' | 'other' | 'your-source';
```

## 🔮 Future Enhancements

Want to add a database later? Consider:
- **Supabase**: PostgreSQL database with easy Next.js integration
- **Firebase**: Real-time database with authentication
- **PlanetScale**: Serverless MySQL database
- **MongoDB Atlas**: NoSQL database option

## 📄 File Structure

```
BookRecords/
├── app/
│   ├── components/
│   │   ├── BookCard.tsx      # Individual book display
│   │   ├── BookForm.tsx       # Add/Edit book form
│   │   └── Stats.tsx          # Statistics dashboard
│   ├── types/
│   │   └── book.ts            # TypeScript type definitions
│   ├── utils/
│   │   └── storage.ts         # localStorage utilities
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main page
├── .github/
│   └── copilot-instructions.md
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🛠️ Development

### Build for Production

```bash
npm run build
```

### Run Production Build

```bash
npm start
```

### Lint Code

```bash
npm run lint
```

### Run Tests

```bash
# Run all unit and component tests
npm test

# Run tests with coverage
npm run test:ci

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all
```

See [TESTING.md](TESTING.md) for comprehensive testing documentation.

## 🧪 Testing

This project includes comprehensive test coverage:

- **Unit Tests**: Test utility functions and business logic
- **Component Tests**: Test React components with React Testing Library
- **E2E Tests**: Test complete user workflows with Playwright
- **CI/CD**: Automated testing on every PR and push

### Test Coverage

- ✅ 31 passing unit & component tests
- ✅ 65%+ code coverage
- ✅ 12 E2E test scenarios
- ✅ Automated CI/CD pipeline with GitHub Actions

### Running Tests

```bash
npm test              # Unit & component tests (watch mode)
npm run test:ci       # Run with coverage
npm run test:e2e      # End-to-end tests
npm run test:e2e:ui   # E2E tests with UI
```

### Debugging

The project includes VS Code debug configurations for:
- Jest unit tests
- Individual test files
- Playwright E2E tests

Press `F5` in VS Code to start debugging tests.

## ⚠️ Important Notes

- **Browser Storage Limit**: localStorage typically has a 5-10MB limit
- **Data is Local**: Data only exists in your browser (use export for backup)
- **Image Size**: Keep images under 500KB to avoid storage issues
- **Browser Compatibility**: Works in all modern browsers

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your needs!

## 📝 License

Free to use and modify for personal or educational purposes.

## 🙋 Support

For issues or questions:
1. Check the browser console for errors
2. Verify localStorage is enabled in your browser
3. Try exporting and re-importing your data
4. Clear browser cache and reload

---

**Happy Reading! 📚✨**

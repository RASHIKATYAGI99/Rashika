const express = require("express")
const { v4: uuidv4 } = require("uuid")
const router = express.Router()

// In-memory storage (replace with database in production)
const books = [
  {
    id: uuidv4(),
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0-7432-7356-5",
    price: 12.99,
    category: "Fiction",
    stock: 50,
  },
  {
    id: uuidv4(),
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0-06-112008-4",
    price: 14.99,
    category: "Fiction",
    stock: 30,
  },
  {
    id: uuidv4(),
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0-13-235088-4",
    price: 45.99,
    category: "Technology",
    stock: 25,
  },
]

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
router.get("/", (req, res) => {
  try {
    let filteredBooks = [...books]

    if (req.query.category) {
      filteredBooks = filteredBooks.filter((book) =>
        book.category.toLowerCase().includes(req.query.category.toLowerCase()),
      )
    }

    if (req.query.author) {
      filteredBooks = filteredBooks.filter((book) => book.author.toLowerCase().includes(req.query.author.toLowerCase()))
    }

    res.json(filteredBooks)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch books", code: 500 })
  }
})

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
router.get("/:id", (req, res) => {
  try {
    const book = books.find((b) => b.id === req.params.id)
    if (!book) {
      return res.status(404).json({ error: "Book not found", code: 404 })
    }
    res.json(book)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch book", code: 500 })
  }
})

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               isbn:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       400:
 *         description: Invalid input
 */
router.post("/", (req, res) => {
  try {
    const { title, author, isbn, price, category, stock } = req.body

    if (!title || !author || !price) {
      return res.status(400).json({
        error: "Title, author, and price are required",
        code: 400,
      })
    }

    const newBook = {
      id: uuidv4(),
      title,
      author,
      isbn: isbn || "",
      price: Number.parseFloat(price),
      category: category || "General",
      stock: Number.parseInt(stock) || 0,
    }

    books.push(newBook)
    res.status(201).json(newBook)
  } catch (error) {
    res.status(500).json({ error: "Failed to create book", code: 500 })
  }
})

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update a book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
router.put("/:id", (req, res) => {
  try {
    const bookIndex = books.findIndex((b) => b.id === req.params.id)
    if (bookIndex === -1) {
      return res.status(404).json({ error: "Book not found", code: 404 })
    }

    const updatedBook = { ...books[bookIndex], ...req.body, id: req.params.id }
    books[bookIndex] = updatedBook

    res.json(updatedBook)
  } catch (error) {
    res.status(500).json({ error: "Failed to update book", code: 500 })
  }
})

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 */
router.delete("/:id", (req, res) => {
  try {
    const bookIndex = books.findIndex((b) => b.id === req.params.id)
    if (bookIndex === -1) {
      return res.status(404).json({ error: "Book not found", code: 404 })
    }

    books.splice(bookIndex, 1)
    res.json({ message: "Book deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: "Failed to delete book", code: 500 })
  }
})

module.exports = router
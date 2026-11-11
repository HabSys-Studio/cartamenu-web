const { DatabaseSync } = require('node:sqlite')

const db = new DatabaseSync('prisma/dev.db')
const settings = db.prepare('SELECT * FROM StoreSettings LIMIT 1').get()
const restaurantId = 'default'
const now = new Date().toISOString()

const theme = {
  bgColor: settings?.bgColor ?? '#0a0a0a',
  menuTitleColor: settings?.menuTitleColor ?? '#f59e0b',
  searchBgColor: settings?.searchBgColor ?? '#171717',
  searchBtnColor: settings?.searchBtnColor ?? '#262626',
  searchBtnTextColor: settings?.searchBtnTextColor ?? '#ededed',
  cardBgColor: settings?.cardBgColor ?? '#171717',
  cardTitleColor: settings?.cardTitleColor ?? '#ededed',
  cardDescColor: settings?.cardDescColor ?? '#a3a3a3',
  cardPriceColor: settings?.cardPriceColor ?? '#f59e0b',
  cardBtnColor: settings?.cardBtnColor ?? '#f59e0b',
  cardBtnTextColor: settings?.cardBtnTextColor ?? '#0a0a0a',
  updatedAt: settings?.updatedAt ?? now,
}

db.exec('PRAGMA foreign_keys = OFF')
db.exec('BEGIN')

db.exec(`
  CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bgColor" TEXT NOT NULL DEFAULT '#0a0a0a',
    "menuTitleColor" TEXT NOT NULL DEFAULT '#f59e0b',
    "searchBgColor" TEXT NOT NULL DEFAULT '#171717',
    "searchBtnColor" TEXT NOT NULL DEFAULT '#262626',
    "searchBtnTextColor" TEXT NOT NULL DEFAULT '#ededed',
    "cardBgColor" TEXT NOT NULL DEFAULT '#171717',
    "cardTitleColor" TEXT NOT NULL DEFAULT '#ededed',
    "cardDescColor" TEXT NOT NULL DEFAULT '#a3a3a3',
    "cardPriceColor" TEXT NOT NULL DEFAULT '#f59e0b',
    "cardBtnColor" TEXT NOT NULL DEFAULT '#f59e0b',
    "cardBtnTextColor" TEXT NOT NULL DEFAULT '#0a0a0a',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )
`)

db.prepare(`
  INSERT INTO "Restaurant" (
    "id", "name", "slug",
    "bgColor", "menuTitleColor", "searchBgColor", "searchBtnColor", "searchBtnTextColor",
    "cardBgColor", "cardTitleColor", "cardDescColor", "cardPriceColor", "cardBtnColor", "cardBtnTextColor",
    "createdAt", "updatedAt"
  ) VALUES (?, 'Carta Menú', 'carta-menu', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  restaurantId,
  theme.bgColor,
  theme.menuTitleColor,
  theme.searchBgColor,
  theme.searchBtnColor,
  theme.searchBtnTextColor,
  theme.cardBgColor,
  theme.cardTitleColor,
  theme.cardDescColor,
  theme.cardPriceColor,
  theme.cardBtnColor,
  theme.cardBtnTextColor,
  now,
  theme.updatedAt
)

db.exec(`
  CREATE TABLE "new_Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "restaurantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Category_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )
`)
db.prepare(`
  INSERT INTO "new_Category" ("id", "name", "order", "restaurantId", "createdAt")
  SELECT "id", "name", "order", ?, "createdAt" FROM "Category"
`).run(restaurantId)
db.exec('DROP TABLE "Category"')
db.exec('ALTER TABLE "new_Category" RENAME TO "Category"')
db.exec('CREATE INDEX "Category_restaurantId_idx" ON "Category"("restaurantId")')

db.exec(`
  CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "imageUrl" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Product_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )
`)
db.prepare(`
  INSERT INTO "new_Product" (
    "id", "name", "description", "price", "imageUrl", "available", "order", "categoryId", "restaurantId", "createdAt"
  )
  SELECT "id", "name", "description", "price", "imageUrl", "available", "order", "categoryId", ?, "createdAt"
  FROM "Product"
`).run(restaurantId)
db.exec('DROP TABLE "Product"')
db.exec('ALTER TABLE "new_Product" RENAME TO "Product"')
db.exec('CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId")')
db.exec('CREATE INDEX "Product_restaurantId_idx" ON "Product"("restaurantId")')

db.exec(`
  CREATE TABLE "new_AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    CONSTRAINT "AdminUser_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )
`)
db.prepare(`
  INSERT INTO "new_AdminUser" ("id", "email", "password", "restaurantId")
  SELECT "id", "email", "password", ? FROM "AdminUser"
`).run(restaurantId)
db.exec('DROP TABLE "AdminUser"')
db.exec('ALTER TABLE "new_AdminUser" RENAME TO "AdminUser"')
db.exec('CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email")')
db.exec('CREATE INDEX "AdminUser_restaurantId_idx" ON "AdminUser"("restaurantId")')

db.exec('DROP TABLE "StoreSettings"')
db.exec('CREATE UNIQUE INDEX "Restaurant_slug_key" ON "Restaurant"("slug")')

db.exec('COMMIT')
db.exec('PRAGMA foreign_keys = ON')

const counts = ['Restaurant', 'Category', 'Product', 'AdminUser'].map((table) => {
  const row = db.prepare(`SELECT COUNT(*) AS c FROM "${table}"`).get()
  return `${table}=${row.c}`
})
console.log(counts.join(' '))

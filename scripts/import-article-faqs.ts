import { db } from "../server/db";
import { articleFaqs } from "../shared/schema";
import { parse } from "csv-parse/sync";
import fs from "fs";

async function importArticleFaqs() {
  const csvPath = "./attached_assets/article_faqs_1770197019938.csv";
  
  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found:", csvPath);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvPath, "utf-8");
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Found ${records.length} FAQ records to import`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const record of records) {
    try {
      const cleanTimestamp = (ts: string) => {
        return ts.replace(/^"+|"+$/g, '');
      };

      await db.insert(articleFaqs).values({
        id: record.id,
        articleId: record.article_id,
        question: record.question,
        answer: record.answer,
        displayOrder: parseInt(record.display_order) || 0,
        isActive: record.is_active || "yes",
        createdAt: new Date(cleanTimestamp(record.created_at)),
        updatedAt: new Date(cleanTimestamp(record.updated_at)),
      }).onConflictDoNothing();
      
      imported++;
    } catch (error: any) {
      if (error.code === '23505') {
        skipped++;
      } else if (error.code === '23503') {
        console.log(`Skipped FAQ "${record.question.substring(0, 40)}..." - article not found`);
        skipped++;
      } else {
        console.error(`Error importing FAQ ${record.id}:`, error.message);
        errors++;
      }
    }
  }

  console.log(`\nImport complete:`);
  console.log(`  Imported: ${imported}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);
  
  process.exit(0);
}

importArticleFaqs().catch(console.error);

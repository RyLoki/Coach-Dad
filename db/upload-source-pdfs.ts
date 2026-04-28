import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing env vars. Run: source .env.local (or export them).");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const BUCKET = "source-docs";

type SourceDoc = {
  slug: string;
  title: string;
  subtitle: string;
  filename: string;
  original_filename: string;
  pages: number;
  level_tags: string[];
};

async function main() {
  const docs: SourceDoc[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../seed/source_documents.json"), "utf-8")
  );

  console.log(`Uploading ${docs.length} PDFs to bucket "${BUCKET}"...\n`);

  for (const doc of docs) {
    const localPath = path.join(__dirname, "../source-pdfs", doc.filename);
    if (!fs.existsSync(localPath)) {
      console.error(`  MISSING: ${localPath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(localPath);
    console.log(`  Uploading ${doc.filename} (${(fileBuffer.length / 1024 / 1024).toFixed(1)} MB)...`);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(doc.filename, fileBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error(`    Upload error: ${uploadError.message}`);
      continue;
    }

    const storageUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${doc.filename}`;

    const { error: dbError } = await supabase.from("source_documents").upsert(
      {
        slug: doc.slug,
        title: doc.title,
        subtitle: doc.subtitle,
        filename: doc.filename,
        pages: doc.pages,
        level_tags: doc.level_tags,
        storage_url: storageUrl,
      },
      { onConflict: "slug" }
    );

    if (dbError) {
      console.error(`    DB error: ${dbError.message}`);
    } else {
      console.log(`    ✓ ${doc.slug} → ${storageUrl}`);
    }
  }

  console.log("\nDone.");
}

main();

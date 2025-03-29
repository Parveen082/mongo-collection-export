const { MongoClient } = require("mongodb");
const fs = require("fs");

const uri = ""; // Apna MongoDB connection string yahan dalna
const client = new MongoClient(uri);

async function exportData() {
    try {
        await client.connect();
        const db = client.db("KeshvaCredit");
        const collection = db.collection("userdb");

        // Total records count
        const totalRecords = await collection.countDocuments();
        console.log(`Total records in collection: ${totalRecords}`);

        // Create a write stream for large data handling
        const writeStream = fs.createWriteStream("output.json");
        writeStream.write("[\n");

        let counter = 0;
        const cursor = collection.find().limit(1001000);

        for await (const doc of cursor) {
            writeStream.write(JSON.stringify(doc, null, 2) + ",\n");
            counter++;

            // Progress update after every 1000 records
            if (counter % 10000 === 0) {
                console.log(`Exported ${counter} records...`);
            }
        }

        // Closing JSON array properly
        writeStream.write("{}]\n"); // Empty object to remove the last comma issue
        writeStream.end();

        console.log(`Data export completed! Total records exported: ${counter}`);

    } catch (err) {
        console.error("Error exporting data:", err);
    } finally {
        await client.close();
    }
}

exportData();

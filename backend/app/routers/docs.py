import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS

router = APIRouter()

UPLOAD_DIR = "uploads"
VECTORSTORE_DIR = "vectorstore/faiss_index"


embeddings = OpenAIEmbeddings()
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)


@router.get("/ping")
def ping():
    return {"module": "Document Search", "status": "ok"}


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # 1. Load PDF text
    loader = PyPDFLoader(file_path)
    pages = loader.load()

    # 2. Split into chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    chunks = splitter.split_documents(pages)

    # 3. Embed + store in FAISS (create new or add to existing index)
    if os.path.exists(VECTORSTORE_DIR):
        db = FAISS.load_local(VECTORSTORE_DIR, embeddings, allow_dangerous_deserialization=True)
        db.add_documents(chunks)
    else:
        db = FAISS.from_documents(chunks, embeddings)

    db.save_local(VECTORSTORE_DIR)

    return {
        "filename": file.filename,
        "chunks_added": len(chunks),
        "status": "indexed successfully"
    }


class QueryRequest(BaseModel):
    question: str


@router.post("/query")
async def query_docs(request: QueryRequest):
    if not os.path.exists(VECTORSTORE_DIR):
        raise HTTPException(status_code=400, detail="No documents indexed yet. Upload a PDF first.")

    db = FAISS.load_local(VECTORSTORE_DIR, embeddings, allow_dangerous_deserialization=True)
    results = db.similarity_search(request.question, k=4)

    context = "\n\n".join([doc.page_content for doc in results])

    prompt = f"""Answer the question using ONLY the context below.
If the answer isn't in the context, say "I couldn't find that in the document."

Context:
{context}

Question: {request.question}

Answer:"""

    response = llm.invoke(prompt)

    return {
        "question": request.question,
        "answer": response.content,
        "matched_chunks": len(results)
    }
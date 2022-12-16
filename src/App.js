import React, { useEffect, useState } from "react";
import supabase from "./supabase";
import "./app.css";

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

const Loader = () => {
  return <p className="message">Loading...</p>;
};

const Header = ({ showForm, setShowForm }) => {
  const appTitle = "Today I learned!";

  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" alt="Today I learned logo" />
        <h1>{appTitle}</h1>
      </div>
      <button
        className="btn btn-lg btn-open"
        onClick={() => setShowForm((show) => !show)}
      >
        {!showForm ? "Share a Fact" : "Close"}
      </button>
    </header>
  );
};

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

const NewFactForm = ({ setShowForm, setFacts }) => {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(e) {
    //1.prevent browser reload
    e.preventDefault();
    //2.check if data is valid.if so, create a new fact
    if (text && isValidHttpUrl(source) && category) {
      //3.create a new fact
      // const newFact = {
      //   text: text,
      //   source: source,
      //   category: category.toLowerCase(),
      // };

      // 3. Upload fact to Supabase and receive the new fact object
      setIsUploading(true);
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ text, source, category: category.toLowerCase() }])
        .select();
      setIsUploading(false);

      // 4. Add the new fact to the UI: add the fact to state
      if (!error) setFacts((facts) => [newFact[0], ...facts]);

      // 5. Reset input fields
      setText("");
      setSource("");
      setCategory("");

      // 6. Close the form
      setShowForm(false);
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength="200"
        disabled={isUploading}
      />
      <span>{200 - text.length}</span>
      <input
        type="text"
        placeholder="Trustworthy source..."
        value={source}
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose Category</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name}>{cat.name.toUpperCase()}</option>
        ))}
      </select>
      <button className="btn btn-lg" disabled={isUploading}>
        Post
      </button>
    </form>
  );
};

const CategoryFilter = ({ setCurrentCatgory }) => {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCatgory("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => {
          return (
            <li className="category" key={cat.name}>
              <button
                className="btn btn-category"
                style={{ backgroundColor: cat.color }}
                onClick={() => setCurrentCatgory(cat.name)}
              >
                {cat.name}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

const FactList = ({ facts, setFacts }) => {
  if (facts.length === 0) {
    return (
      <p className="message">
        No facts for this category yet. Create the first one ✌
      </p>
    );
  }
  return (
    <section className="facts-section">
      <ul className="facts-list">
        {facts.map((el) => (
          <Fact el={el} key={el.id} setFacts={setFacts} />
        ))}
      </ul>
      <p>There are only {facts.length} facts. Add your own!</p>
    </section>
  );
};

const Fact = ({ el, setFacts }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed = el.votesFalse >= el.votesInteresting + el.votesMindblowing;

  async function handleVote(columnName) {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [columnName]: el[columnName] + 1 })
      .eq("id", el.id)
      .select();
    setIsUpdating(false);
    if (!error)
      setFacts((facts) =>
        facts.map((f) => (f.id === el.id ? updatedFact[0] : f))
      );
  }

  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[⛔DISPUTED]</span> : null}
        {el.text}
        <a className="source" href={el.source} target="_blank" rel="noreferrer">
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === el.category)
            .color,
        }}
      >
        {el.category}
      </span>
      <div className="vote-buttons">
        <button
          onClick={() => handleVote("votesInteresting")}
          disabled={isUpdating}
        >
          👍 {el.votesInteresting}
        </button>
        <button
          onClick={() => handleVote("votesMindblowing")}
          disabled={isUpdating}
        >
          🤯 {el.votesMindblowing}
        </button>
        <button onClick={() => handleVote("votesFalse")} disabled={isUpdating}>
          ⛔ {el.votesFalse}
        </button>
      </div>
    </li>
  );
};

const App = () => {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCatgory, setCurrentCatgory] = useState("all");

  useEffect(() => {
    async function getFacts() {
      setIsLoading(true);

      let query = supabase.from("facts").select("*");

      if (currentCatgory !== "all") {
        query = query.eq("category", currentCatgory);
      }

      const { data: facts, error } = await query
        .order("text", { ascending: false })
        .limit(100);
      if (!error) {
        setFacts(facts);
      } else alert("There was a problem getting data");

      setIsLoading(false);
    }

    getFacts();
  }, [currentCatgory]);

  return (
    <>
      <Header setShowForm={setShowForm} showForm={showForm} />
      {showForm ? (
        <NewFactForm setShowForm={setShowForm} setFacts={setFacts} />
      ) : null}
      <main className="main">
        <CategoryFilter setCurrentCatgory={setCurrentCatgory} />
        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
};

export default App;

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChoiceList } from "@/components/ChoiceList";
import type { TrackOption } from "@/lib/types";

const options: TrackOption[] = [
  { id: 1, label: "Artista A — Canzone A", isCorrect: true },
  { id: 2, label: "Artista B — Canzone B", isCorrect: false },
  { id: 3, label: "Artista C — Canzone C", isCorrect: false },
  { id: 4, label: "Artista D — Canzone D", isCorrect: false },
];

const noop = () => {};

describe("ChoiceList", () => {
  it("renderizza tutte le opzioni", () => {
    render(
      <ChoiceList
        options={options}
        selectedId={null}
        result="idle"
        onSelect={noop}
        disabled={false}
      />
    );
    expect(screen.getAllByRole("button")).toHaveLength(4);
    expect(screen.getByText("Artista A — Canzone A")).toBeInTheDocument();
  });

  it('ha un role="radiogroup" con aria-label', () => {
    render(
      <ChoiceList
        options={options}
        selectedId={null}
        result="idle"
        onSelect={noop}
        disabled={false}
      />
    );
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-label");
  });

  it("chiama onSelect con l'opzione giusta al click", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(
      <ChoiceList
        options={options}
        selectedId={null}
        result="idle"
        onSelect={onSelect}
        disabled={false}
      />
    );
    await user.click(screen.getByText("Artista B — Canzone B"));
    expect(onSelect).toHaveBeenCalledWith(options[1]);
  });

  it("non chiama onSelect quando disabled=true", async () => {
    const user = userEvent.setup();
    const onSelect = jest.fn();
    render(
      <ChoiceList
        options={options}
        selectedId={null}
        result="idle"
        onSelect={onSelect}
        disabled={true}
      />
    );
    const buttons = screen.getAllByRole("button");
    for (const btn of buttons) {
      expect(btn).toBeDisabled();
    }
    await user.click(buttons[0]).catch(() => {});
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("applica classe CSS 'correct' sulla risposta giusta dopo selezione sbagliata", () => {
    render(
      <ChoiceList
        options={options}
        selectedId={2}
        result="wrong"
        onSelect={noop}
        disabled={true}
      />
    );
    // Il bottone con la risposta corretta (id=1) deve avere la classe .correct
    const correctBtn = screen.getByText("Artista A — Canzone A").closest("button");
    expect(correctBtn?.className).toMatch(/correct/);
    // Il bottone sbagliato selezionato (id=2) deve avere la classe .wrong
    const wrongBtn = screen.getByText("Artista B — Canzone B").closest("button");
    expect(wrongBtn?.className).toMatch(/wrong/);
  });

  it("nessun feedback visivo se selectedId è null", () => {
    render(
      <ChoiceList
        options={options}
        selectedId={null}
        result="idle"
        onSelect={noop}
        disabled={false}
      />
    );
    const buttons = screen.getAllByRole("button");
    for (const btn of buttons) {
      expect(btn.className).not.toMatch(/correct|wrong/);
    }
  });
});
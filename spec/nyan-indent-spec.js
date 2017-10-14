'use babel';

import {
  openTestFile,
  findDecorations,
  getColors,
  activatePackage,
  findDecorationByColor,
} from './helpers';

const text = `
no tab here
  tabulation of 1
    tabulation of 2
      tabulation of 3
        tabulation of 4
          tabulation of 5
`;

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('NyanIndent', () => {
  beforeEach(() => {
    waitsForPromise(() => openTestFile(atom));

    waitsForPromise(() => activatePackage(atom));
  });

  it('Should activate package', () => {
    expect(atom.packages.isPackageActive('nyan-indent')).toBeTruthy();
  });

  it('Should update paint in multiple lines', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(text);

    const decorations = findDecorations(editor);
    expect(decorations.length).toBe(15);

    const colors = getColors(atom);

    // There should be 5 red "indentations" from top to bottom
    const firstTabDecorations = findDecorationByColor(decorations, colors[0]);
    expect(
      firstTabDecorations.length,
    ).toBe(5);

    // There should be 4 yellow "indentations" from top to bottom
    const secondTabDecorations = findDecorationByColor(decorations, colors[1]);
    expect(
      secondTabDecorations.length,
    ).toBe(4);

    // There should be 3 green "indentations" from top to bottom
    const thirdTabDecorations = findDecorationByColor(decorations, colors[2]);
    expect(
      thirdTabDecorations.length,
    ).toBe(3);

    // There should be 2 blue "indentations" from top to bottom
    const fourthTabDecorations = findDecorationByColor(decorations, colors[3]);
    expect(
      fourthTabDecorations.length,
    ).toBe(2);

    // There should be 1 purple "indentation" from top to bottom
    const fifthTabDecorations = findDecorationByColor(decorations, colors[4]);
    expect(
      fifthTabDecorations.length,
    ).toBe(1);
  });
});

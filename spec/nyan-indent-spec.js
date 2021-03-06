'use babel';

import {
  openTestFile,
  findDecorations,
  getPreferences,
  activatePackage,
  findDecorationsByActivePreferences,
  togglePackage,
} from './helpers';

const indentedText = `
no tab here
  tabulation of 1
    tabulation of 2
      tabulation of 3
        tabulation of 4
          tabulation of 5
`;

const notIndentedText = `
no tab here
tabulation of 1
tabulation of 2
tabulation of 3
tabulation of 4
tabulation of 5
`;

const indentedLine = '        indentation of 4';

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

    editor.setText(indentedText);

    const decorations = findDecorationsByActivePreferences(editor, atom);
    expect(decorations.length).toBe(15);

    // There should be 5 red "indentations" from top to bottom
    expect(
      decorations.indentations[0],
    ).toBe(5);

    // There should be 4 yellow "indentations" from top to bottom
    expect(
      decorations.indentations[1],
    ).toBe(4);

    // There should be 3 green "indentations" from top to bottom
    expect(
      decorations.indentations[2],
    ).toBe(3);

    // There should be 2 blue "indentations" from top to bottom
    expect(
      decorations.indentations[3],
    ).toBe(2);

    // There should be 1 purple "indentation" from top to bottom
    expect(
      decorations.indentations[4],
    ).toBe(1);
  });

  it('Should update when editing current line', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(notIndentedText);

    // Adds 2 tabulations
    const textToInsert = '    tabulation of 3';
    editor.setTextInBufferRange([[4, 0], [4, 21]], textToInsert);
    const firstDecorations = findDecorationsByActivePreferences(editor, atom);

    expect(firstDecorations.length).toBe(2);

    // Adds another tabulation in another line
    const textToInsert2 = '  tabulation of 4';
    editor.setTextInBufferRange([[5, 0], [5, 21]], textToInsert2);
    const secondDecorations = findDecorationsByActivePreferences(editor, atom);

    expect(secondDecorations.length).toBe(3);

    // There should be 2 first colors
    expect(
      secondDecorations.indentations[0],
    ).toBe(2);

    // There should be 1 second color
    expect(
      secondDecorations.indentations[1],
    ).toBe(1);
  });

  it('Should remove all paint toggling the package', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(indentedText);
    expect(findDecorations(editor).length).toBe(15);

    // Toggles off
    togglePackage(atom);

    expect(findDecorations(editor).length).toBe(0);
  });

  it('Should repaint after toggling package', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(indentedText);
    expect(findDecorations(editor).length).toBe(15);

    // Toggles off
    togglePackage(atom);
    // Toggles on
    togglePackage(atom);

    expect(findDecorations(editor).length).toBe(15);
  });

  it('Shoud not paint text once package is toggled off', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(indentedText);

    // Toggles off
    togglePackage(atom);

    // Adds 2 tabulations
    const textToInsert = '    tabulation of 3';
    editor.setTextInBufferRange([[4, 0], [4, 22]], textToInsert);

    // Adds 3 tabulations
    const textToInsert2 = '      tabulation of 4';
    editor.setTextInBufferRange([[4, 0], [5, 21]], textToInsert2);

    // Sets the cursor at the last line
    editor.setCursorScreenPosition([5, 26]);
    editor.insertNewline();
    editor.insertText('Hey');

    const decorations = findDecorations(editor);
    expect(decorations.length).toBe(0);
  });

  it('Should paint text once package is toggled back on', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(notIndentedText);

    // Toggles off
    togglePackage(atom);
    // Toggles on
    togglePackage(atom);

    // Adds 2 tabulations
    const textToInsert = '    tabulation of 3';
    editor.setTextInBufferRange([[4, 0], [4, 21]], textToInsert);
    const decorations = findDecorations(editor);

    expect(decorations.length).toBe(2);
  });

  it('Should set correct paint when removing indentation from a single line', () => {
    const editor = atom.workspace.getActiveTextEditor();

    editor.setText(indentedLine);
    expect(findDecorations(editor).length).toBe(4);

    const indentedLine2 = '      indentation of 3';
    editor.setTextInBufferRange([[0, 0], [0, 24]], indentedLine2);
    expect(findDecorations(editor).length).toBe(3);

    const indentedLine3 = '    indentation of 2';
    editor.setTextInBufferRange([[0, 0], [0, 22]], indentedLine3);
    expect(findDecorations(editor).length).toBe(2);
  });

  it('Should change when a new set of colors change', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(indentedText);
    const decorationsBeforeChange = findDecorationsByActivePreferences(editor, atom);

    expect(decorationsBeforeChange.chosenColor.nyan).toBe(15);

    atom.config.set('nyan-indent.color', 'blue');

    const decorationsAfterChange = findDecorationsByActivePreferences(editor, atom);
    expect(decorationsAfterChange.chosenColor.blue).toBe(15);
    expect(decorationsAfterChange.chosenColor.nyan).toBe(undefined);
  });

  it('Should change when the opacity is changed', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(indentedText);
    const decorationsBeforeChange = findDecorationsByActivePreferences(editor, atom);
    expect(decorationsBeforeChange.opacity['0.4']).toBe(15);

    atom.config.set('nyan-indent.opacity', '80');

    const decorationsAfterChange = findDecorationsByActivePreferences(editor, atom);
    expect(decorationsAfterChange.opacity['0.8']).toBe(15);
    expect(decorationsAfterChange.opacity['0.4']).toBe(undefined);
  });

  it('Should use custom colors when activates option', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(indentedText);
    const decorationsBeforeChange = findDecorationsByActivePreferences(editor, atom);
    expect(decorationsBeforeChange.chosenColor.nyan).toBe(15);

    atom.config.set('nyan-indent.useCustomColors', true);

    const decorationsAfterChange = findDecorationsByActivePreferences(editor, atom);
    expect(decorationsAfterChange.chosenColor.nyan).toBe(undefined);

    const {
      customColors,
    } = getPreferences(atom);

    expect(decorationsAfterChange.colors[customColors['0'].toHexString()]).toBe(5);
    expect(decorationsAfterChange.colors[customColors['1'].toHexString()]).toBe(4);
    expect(decorationsAfterChange.colors[customColors['2'].toHexString()]).toBe(3);
    expect(decorationsAfterChange.colors[customColors['3'].toHexString()]).toBe(2);
    expect(decorationsAfterChange.colors[customColors['4'].toHexString()]).toBe(1);
  });

  it('Should change painting when changing custom colors', () => {
    const editor = atom.workspace.getActiveTextEditor();
    editor.setText(indentedText);
    atom.config.set('nyan-indent.useCustomColors', true);

    const {
      customColors: customColorsBefore,
    } = getPreferences(atom);
    const decorationsBeforeChange = findDecorationsByActivePreferences(editor, atom);

    expect(decorationsBeforeChange.colors[customColorsBefore['0'].toHexString()]).toBe(5);
    expect(decorationsBeforeChange.colors[customColorsBefore['1'].toHexString()]).toBe(4);
    expect(decorationsBeforeChange.colors[customColorsBefore['2'].toHexString()]).toBe(3);
    expect(decorationsBeforeChange.colors[customColorsBefore['3'].toHexString()]).toBe(2);
    expect(decorationsBeforeChange.colors[customColorsBefore['4'].toHexString()]).toBe(1);

    atom.config.set('nyan-indent.customColors', {
      0: '#0c6164',
      1: '#075154',
      2: '#044244',
      3: '#02383a',
      4: '#002c2d',
    });
    const decorationsAfterChange = findDecorationsByActivePreferences(editor, atom);

    expect(decorationsAfterChange.colors[customColorsBefore['0'].toHexString()]).toBe(undefined);
    expect(decorationsAfterChange.colors[customColorsBefore['1'].toHexString()]).toBe(undefined);
    expect(decorationsAfterChange.colors[customColorsBefore['2'].toHexString()]).toBe(undefined);
    expect(decorationsAfterChange.colors[customColorsBefore['3'].toHexString()]).toBe(undefined);
    expect(decorationsAfterChange.colors[customColorsBefore['4'].toHexString()]).toBe(undefined);

    expect(decorationsAfterChange.colors['#0c6164']).toBe(5);
    expect(decorationsAfterChange.colors['#075154']).toBe(4);
    expect(decorationsAfterChange.colors['#044244']).toBe(3);
    expect(decorationsAfterChange.colors['#02383a']).toBe(2);
    expect(decorationsAfterChange.colors['#002c2d']).toBe(1);
  });
});

Feature: The HeaderBar contains a menu to all apps, shortcuts, and commands

    Scenario: The HeaderBar contains a menu icon
        Given the HeaderBar loads without an error
        Then the HeaderBar displays a menu icon

    Scenario: The menu is closed by default
        Given the HeaderBar loads without an error
        Then the HeaderBar does not display the command palette

    Scenario: The user will be offered a menu with apps, shortcuts and commands
        Given the HeaderBar loads without an error
        When the user clicks on the menu icons
        Then the menu opens
        And contains items with links

    Scenario: The app menu closes when the user clicks outside
        Given the HeaderBar loads without an error
        When the user opens the menu
        And the user clicks outside of the menu
        Then the HeaderBar does not display the command palette

![Contributing to ngxsmk-tel-input](contributing-banner.png)

Thank you for your interest in contributing to `ngxsmk-tel-input`! This project is open-source, and we welcome contributions from everyone.

By participating in this project, you are expected to uphold the project's goals of maintaining a high-quality, Angular-native component.

---

## How to Contribute

There are several ways you can help improve this project:

1.  **Report Bugs:** Submit an issue if you find a problem.
2.  **Suggest Features:** Open an issue to propose new functionality.
3.  **Contribute Code:** Submit a Pull Request with bug fixes or new features.

## Reporting Bugs

If you find a bug, please check the [Issues page](https://github.com/NGXSMK/ngxsmk-tel-input/issues) to see if it has already been reported.

When submitting a new bug report, please include:
* **Steps to reproduce** the issue.
* The **expected behavior** and the **actual behavior**.
* Your **Angular version** and the **browser** you are using.
* A minimal reproduction link (e.g., CodePen, JSFiddle) if possible.

## Suggesting Enhancements

If you have an idea for a new feature or an enhancement, please open a new issue on the [Issues page](https://github.com/NGXSMK/ngxsmk-tel-input/issues).

Describe the feature, why you think it would be useful, and how it aligns with the goals of the library.

## Code Contributions (Pull Requests)

We welcome pull requests for bug fixes and new features.

### Development Setup

This project is an Angular workspace containing a library (`ngxsmk-tel-input`) and a demo application (`demo`).

1.  **Fork** the repository and clone it locally:
    ```bash
    git clone git@github.com:your-username/ngxsmk-tel-input.git
    cd ngxsmk-tel-input
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Build the library** to ensure the latest version is available for the demo app:
    ```bash
    ng build ngxsmk-tel-input
    ```
4.  **Run the demo application** to test your changes locally:
    ```bash
    ng serve demo
    ```
    This will serve the demo app, which consumes your local version of the library.

### Testing

Please ensure that your code changes include appropriate tests and that all existing tests pass before submitting a PR.

```bash
# To run all tests
ng test ngxsmk-tel-input
